
// daytime/nighttime 순서 배치 고려해야함!!
// 하루 중 최대 근무수 3개로 제한하려 할 때 야간근무는 인원이 부족할 수 있으므로 야간 우선적으로 실행하고 주간 실행하게 했음.

import * as XLSX from 'xlsx';

import {
  arr,
  Person,
  취사지원,
  전날불침번,
  금일불침번,
  상황병,
  휴가복귀자,
  전역자,
  분대장,
  위병조장,
} from "./workers.mjs"

import express from 'express';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

let dayTimeline;
let nightTimeline;
let lowTimeline;

let 전날당직근무자 = []
let 전날7번근무자 = []
let 불침번;
let 위병조장근무자;
let 오대기근무자;
let 근무열외자;
let 금일휴가복귀자;
// 상황병 임의배치
let 오전상황병 = '유지민';
// 일반근무자 필터링
const regulars = arr.filter((object) => object.isRegular === true);

// 불침번용 중대교대 함수
function coRotation(co) {
  if (co == 12) return 9;
  return co + 1;
}

function getCurrentTime() {
  const now = new Date(); 
  const hours = String(now.getHours()).padStart(2, '0'); 
  const minutes = String(now.getMinutes()).padStart(2, '0'); 
  const seconds = String(now.getSeconds()).padStart(2, '0'); 

  return `${hours}:${minutes}:${seconds}`; // HH:MM:SS 형식으로 반환
}

// 위병조장+오전상황병 중 임의로 두명 뽑기
function getTwoRandomElements(arr) {
  let arrCopy = [...arr, 오전상황병];

  let firstIndex = Math.floor(Math.random() * arrCopy.length);
  let firstElement = arrCopy[firstIndex];

  let secondIndex = Math.floor(Math.random() * arrCopy.length);
  
  while (secondIndex === firstIndex) {
    secondIndex = Math.floor(Math.random() * arrCopy.length);
  }
  let secondElement = arrCopy[secondIndex];

  return [firstElement, secondElement];
}

// 엑셀형식으로 재구성
function generateExcel() {
  const tworandomworkers = getTwoRandomElements(위병조장근무자);
  const data =  [
    [
      '07:30~09:00', , ,'09:00~10:30', , ,'10:30~12:00', , ,'12:00~13:30', , ,'13:00~15:00', , ,'15:00~16:30', , ,'16:30~18:00', , ,'18:00~19:00', ,'19:00~20:00', ,'20:00~21:00', ,'아침조장','저녁조장','21:00~22:00', ,'22:00~23:00', ,'23:00~24:00', ,'00:00~01:00', ,'01:00~02:00', ,'02:00~03:00', ,'03:00~04:00', ,'04:00~05:00', ,'05;00~06:00', ,'06:00~07:30', ,'불침번'
    ],
    [
      ...dayTimeline, ...lowTimeline, 전날당직근무자[1], 전날당직근무자[2], ...tworandomworkers, ...nightTimeline, 불침번
    ]
  ];

  let formattedData = [];
  for (let i = 0; i < data[0].length; i++) {
    formattedData.push([data[0][i], data[1][i]]);
  }

  const ws = XLSX.utils.aoa_to_sheet(formattedData);  // 2차원 배열을 워크시트로 변환
  const wb = XLSX.utils.book_new();         
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1"); 

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
  return excelBuffer;
}

async function setEmployees () {
  
  // import()는 최초 1회만 시행되는 치명적 단점 (서버요청마다 파일을 모듈을 새로 로드해야 새로운 결과가 반환됨)
  let excelOutput;
  try {
    const lowModule = await import('./lowtimeTest.mjs');
    const dayModule = await import('./daytimeTest.mjs');
    const nightModule = await import('./nighttimeTest.mjs');
    
    lowTimeline = lowModule.lowTimeline;
    dayTimeline = dayModule.dayTimeline;
    nightTimeline = nightModule.nightTimeline;
    console.log("모듈 로드 완료");
    console.log(dayTimeline);
    console.log(lowTimeline);
    console.log(nightTimeline);

    excelOutput = generateExcel();

  } catch (error) {
    console.error('모듈 로드 실패:', error);
    throw error;
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("setEmployees 작업 완료!");
      resolve(excelOutput); 
    }, 2000);
  });
}

app.get('/api/getTimelines', async (req, res) => {
  try {

    const wb = await setEmployees();
    res.setHeader("Content-Disposition", "attachment; filename=SampleData.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(wb);

  } catch (error) {
    console.error('에러 발생:', error);
    res.status(500).send('서버 오류');
  }
});

// multer로 폼 데이터 파싱
const upload = multer();
app.post('/submit', upload.none(), (req, res) => {
  const formdata = req.body;
  전날7번근무자 = formdata['multi-input'][3];
  전날7번근무자 = 전날7번근무자.split(',').map(item => item.trim());
  arr.forEach(worker => {
    if (전날7번근무자.includes(worker.name)) {
        worker.add([8]);
    }
  });

  전날당직근무자 = formdata['multi-input'][0];
  전날당직근무자 = 전날당직근무자.split(',').map(item => item.trim());
  let a = arr.find((worker)=>worker.name===전날당직근무자[0]);
  a.add(전날불침번);
  // 금일불침번 선정
  let nextCO = a.co;
  // 이 부분 무한루프 가능성있으므로 에러처리 필요해보임
  while(1) {
    nextCO = coRotation(nextCO);
    if(regulars.some(person=>person.co===nextCO)) break;
  }
  let cand = regulars.filter(person=>person.co===nextCO);
  let randindex = Math.floor(Math.random() * cand.length);
  let b = regulars.find((worker)=>worker.name===cand[randindex].name);
  불침번 = b.name;
  b.add(금일불침번);

  위병조장근무자 = formdata['multi-input'][1];
  위병조장근무자 = 위병조장근무자.split(',').map(item => item.trim());
  arr.forEach(worker => {
    if (위병조장근무자.includes(worker.name)) {
        worker.add(위병조장);
    }
  });
  오대기근무자 = formdata['multi-input'][2];
  오대기근무자 = 오대기근무자.split(',').map(item => item.trim());
  arr.forEach(worker => {
    if (오대기근무자.includes(worker.name)) {
        worker.add(전역자);
    }
  });
  근무열외자 = formdata['multi-input'][4];
  근무열외자 = 근무열외자.split(',').map(item => item.trim());
  arr.forEach(worker => {
    if (근무열외자.includes(worker.name)) {
        worker.add(전역자);
    }
  });
  금일휴가복귀자 = formdata['multi-input'][5];
  금일휴가복귀자 = 금일휴가복귀자.split(',').map(item => item.trim());
  arr.forEach(worker => {
    if (금일휴가복귀자.includes(worker.name)) {
        worker.add(휴가복귀자);
    }
  });
  res.json({ message: 'Data received successfully!' });
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

export { setEmployees };
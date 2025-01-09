// import { lowTimeline } from "./lowtimeTest.mjs";
// // daytime/nighttime 순서 배치 고려해야함!!
// // 하루 중 최대 근무수 3개로 제한하려 할 때 야간근무는 인원이 부족할 수 있으므로 야간 우선적으로 실행하고 주간 실행하게 했음.
// import { nightTimeline } from "./nighttimeTest.mjs"
// import { dayTimeline } from "./daytimeTest.mjs"

import * as XLSX from 'xlsx';
// import { JSDOM } from 'jsdom';
// import fs from 'fs';

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
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Express 서버 생성
const app = express();
const port = 3000;

let dayTimeline;
let nightTimeline;
let lowTimeline;

function getCurrentTime() {
  const now = new Date(); 
  const hours = String(now.getHours()).padStart(2, '0'); 
  const minutes = String(now.getMinutes()).padStart(2, '0'); 
  const seconds = String(now.getSeconds()).padStart(2, '0'); 

  return `${hours}:${minutes}:${seconds}`; // HH:MM:SS 형식으로 반환
}
// 엑셀형식으로 재구성
function generateExcel() {
  const data = [];
  data.push(dayTimeline);
  data.push(lowTimeline);
  data.push(nightTimeline);

  const ws = XLSX.utils.aoa_to_sheet(data);  // 2차원 배열을 워크시트로 변환
  const wb = XLSX.utils.book_new();         
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1"); 
  XLSX.writeFile(wb, `${getCurrentTime()}.xlsx`); 
}

let 전날당직근무자 = []
let 전날7번근무자 = []
let 불침번;
let 위병조장근무자;
let 오대기근무자;
let 근무열외자;
let 금일휴가복귀자;
async function setEmployees () {
  
  console.log("근무자 설정")

  // const form5 = document.getElementById("form");
  // form5.submit();
  // 전날당직근무자 = document.getElementById("multi0");
  // 불침번 = 전날당직근무자.value;
  // 불침번 = 불침번.split(",")[0];
  // 불침번 = 불침번.trim();
  // 위병조장근무자 = document.getElementById("multi1");
  // if(위병조장근무자.value!="") {
  //   위병조장근무자 = 위병조장근무자.value.split(",");
  //   위병조장근무자.forEach((e)=>{
  //     let a = arr.find(person=>person.name===e.trim());
  //     a.add(위병조장);
  //   })
  // }
  // 오대기근무자 = document.getElementById("multi2");
  // 근무열외자 = document.getElementById("multi3");
  // 금일휴가복귀자 = document.getElementById("multi4");
  // 전날7번근무자 = document.getElementById("multi5");

  // import()는 최초 1회만 시행되는 치명적 단점 (서버요청마다 파일을 모듈을 새로 로드해야 새로운 결과가 반환됨)
  // import('./lowtimeTest.mjs')
  // .then((module) => {
  //   lowTimeline=module.lowTimeline;
  //   console.log("1번째 모듈 로드");
  // })
  // .catch((error) => {
  //   console.log('모듈 로드 실패:', error);
  // });
  // import('./daytimeTest.mjs')
  // .then((module) => {
  //   dayTimeline=module.dayTimeline;
  //   console.log("2번째 모듈 로드");
  // })
  // .catch((error) => {
  //   console.error('모듈 로드 실패:', error);
  // });
  // import('./nighttimeTest.mjs')
  // .then((module) => {
  //   nightTimeline=module.nightTimeline;
  //   console.log("3번째 모듈 로드");
  //   console.log(dayTimeline);
  //   console.log(lowTimeline);
  //   console.log(nightTimeline);
  //   arr.forEach((e)=>{
  //     if(e.count!=0 && e.isRegular) console.log(`${e.name} : ${e.count}`);
  //   })
  //   console.log("----------")
  //   arr.forEach((e)=>{
  //     if(e.count==0 && e.isRegular) console.log(`${e.name} : ${e.count}`);
  //   })
  
  //   // 데이터 토대로 새로운 엑셀파일 생성
  //   generateExcel();
  // })
  // .catch((error) => {
  //   console.error('모듈 로드 실패:', error);
  // });

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

    generateExcel();

  } catch (error) {
    console.error('모듈 로드 실패:', error);
    throw error;
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("setEmployees 작업 완료!");
      resolve(); 
    }, 2000);
  });
}

app.get('/api/getTimelines', async (req, res) => {
  try {
    console.log("잠시 대기...");

    await setEmployees();

    res.json({ lowTimeline, dayTimeline, nightTimeline });

  // delete require.cache[require.resolve('./lowtimeTest.mjs')];
  // delete require.cache[require.resolve('./daytimeTest.mjs')];
  // delete require.cache[require.resolve('./nighttimeTest.mjs')];

  } catch (error) {
    console.error('에러 발생:', error);
    res.status(500).send('서버 오류');
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

export { setEmployees };
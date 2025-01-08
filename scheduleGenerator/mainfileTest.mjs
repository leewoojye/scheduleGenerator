// import { lowTimeline } from "./lowtimeTest.mjs";
// // daytime/nighttime 순서 배치 고려해야함!!
// // 하루 중 최대 근무수 3개로 제한하려 할 때 야간근무는 인원이 부족할 수 있으므로 야간 우선적으로 실행하고 주간 실행하게 했음.
// import { nightTimeline } from "./nighttimeTest.mjs"
// import { dayTimeline } from "./daytimeTest.mjs"
import * as XLSX from 'xlsx';
import { JSDOM } from 'jsdom';
import fs from 'fs';
// const html = fs.readFileSync('index.html', 'utf8');
// const dom = new JSDOM(html);
// const document = dom.window.document;

// // DOM 작업
// const element = document.getElementById('form');
// console.log(element);

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
} from "./workers.js"

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
function setEmployees () {
  // console.log("근무자 설정")
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

  import('./lowtimeTest.mjs')
  .then((module) => {
    lowTimeline=module.lowTimeline;
    console.log("1번째 모듈 로드");
  })
  .catch((error) => {
    console.log('모듈 로드 실패:', error);
  });
  import('./daytimeTest.mjs')
  .then((module) => {
    dayTimeline=module.dayTimeline;
    console.log("2번째 모듈 로드");
  })
  .catch((error) => {
    console.error('모듈 로드 실패:', error);
  });
  import('./nighttimeTest.mjs')
  .then((module) => {
    nightTimeline=module.nightTimeline;
    console.log("3번째 모듈 로드");
    console.log(dayTimeline);
    console.log(lowTimeline);
    console.log(nightTimeline);
    arr.forEach((e)=>{
      if(e.count!=0 && e.isRegular) console.log(`${e.name} : ${e.count}`);
    })
    console.log("----------")
    arr.forEach((e)=>{
      if(e.count==0 && e.isRegular) console.log(`${e.name} : ${e.count}`);
    })
  })
  .catch((error) => {
    console.error('모듈 로드 실패:', error);
  });
}

setEmployees();

// arr.forEach((e)=>{
//   if(e.count!=0 && e.isRegular) console.log(`${e.name} : ${e.count}`);
// })
// console.log("----------------------")
// arr.forEach((e)=>{
//   if(e.count==0 && e.isRegular) console.log(`${e.name} : ${e.count}`);
// })

// 엑셀형식으로 재구성
function generateExcel() {
  const data = [
    ["이름", "나이", "직업"],
    ["홍길동", 30, "개발자"],
    ["이순신", 45, "디자이너"],
    ["김유신", 32, "PM"]
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);  // 2차원 배열을 워크시트로 변환
  const wb = XLSX.utils.book_new();          // 새로운 워크북 생성
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");  // 워크시트 추가
  XLSX.writeFile(wb, "sample.xlsx");         // 파일 다운로드
}
// generateExcel();

export { generateExcel, setEmployees }
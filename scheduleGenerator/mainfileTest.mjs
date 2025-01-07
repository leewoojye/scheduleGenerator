import { lowTimeline } from "./lowtimeTest.mjs";
// daytime/nighttime 순서 배치 고려해야함!!
// 하루 중 최대 근무수 3개로 제한하려 할 때 야간근무는 인원이 부족할 수 있으므로 야간 우선적으로 실행하고 주간 실행하게 했음.
import { nightTimeline } from "./nighttimeTest.mjs"
import { dayTimeline } from "./daytimeTest.mjs"
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
} from "./workers.js"

console.log(dayTimeline);
console.log(lowTimeline);
console.log(nightTimeline);

arr.forEach((e)=>{
  if(e.count!=0 && e.isRegular) console.log(`${e.name} : ${e.count}`);
})
console.log("----------------------")
arr.forEach((e)=>{
  if(e.count==0 && e.isRegular) console.log(`${e.name} : ${e.count}`);
})
// console.log(arr);
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
generateExcel();

export { generateExcel }
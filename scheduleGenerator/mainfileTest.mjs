import { lowTimeline } from "./lowtimeTest.mjs";
// daytime/nighttime 순서 배치 고려해야함!!
// 하루 중 최대 근무수 3개로 제한하려 할 때 야간근무는 인원이 부족할 수 있으므로 야간 우선적으로 실행하고 주간 실행하게 했음.
import { nightTimeline } from "./nighttimeTest.mjs"
import { dayTimeline } from "./daytimeTest.mjs"

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
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
} from "./workers.js";

function coRotation(근무자) {
  let co = 근무자.co;
  if (co == 12) return 9;
  return co + 1;
}

const resultArr = new Array(21);
// 근무 한타임을 나타낸 객체 - 해당근무할당받은인원(2/3명) + 해당근무점수
for (let i = 1; i < 21; ++i) {
  let piece = {
    name: [],
    point: 0,
  };
  switch (i) {
    case 8:
    case 11:
      piece.point = 0.5;
    case 9:
    case 10:
    case 12:
    case 13:
      piece.point = 0.3;
    case 14:
    case 7:
      piece.point = 0.4;
    case 15:
    case 16:
    case 17:
      piece.point = 0.9;
    case 19:
    case 20:
    case 1:
      piece.point = 0.6;
    case 2:
    case 3:
    case 4:
    case 5:
      piece.point = 0.7;
    case 6:
      piece.point = 0.8;
    default:
      break;
  }
  resultArr[i] = piece;
}

// html입력에서 받아온 정보를 바탕으로 근무자 유형별 분류 및 배정
let 위병조장근무자 = [arr[이우제], arr[함태규], arr[정유빈], arr[이태경]];
// let 5대기;
// let 열외용사;
// let 금일출타복귀자;
let 전날7번근무자 = [arr[유호재], arr[김동영], arr[김승민]];
resultArr[18].name.push(arr[정범수]); // 전날 당직부관
resultArr[18].name.push(arr[김태훈]); // 전날 당직상황병
arr[문재용].add(전날불침번); // 전날 불침번

// 일반근무자 필터링
const regulars = arr.filter((object) => object.isRegular === true);

// 불침번 배정

// **위병사수, 15~17번 근무자 배정**

// **20, 1~7번 근무자 및 8~14번 근무자 배정**
/*
요구사항 :
연속적인 근무배정 X
위병사수,개인정비근무 배정은 근무점수를 고려할것
22시이후 야간근무는 최대1개 배정
개인정비간 근무 최대1개 배정

*/

for (let i = 1; i < 21; ++i) {
  console.log(`${i}. ------------------------`);
  for (let j = 0; j < resultArr[i].name.length; ++j) {
    console.log(resultArr[i].name[j] + " ");
  }
}

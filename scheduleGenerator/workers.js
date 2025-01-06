let arr = [];

class Person {
  name = "";
  // 근무불가시간대
  unavailable = [];
  // 일반근무 투입여부
  isRegular = true;
  // 당일근무투입 누적횟수
  count = 0;
  // 근무총점
  rank;
  // 복무일
  days;
  // 중대
  co;
  constructor(name, co, rank, days, unavailable = []) {
    if (arguments.length == 5) {
      this.co = co;
      this.name = name;
      this.rank = rank;
      this.days = days;
      this.add(unavailable);
      if (this.unavailable.length == 20) this.isRegular = false;
    } else if (arguments.length == 4) {
      this.co = co;
      this.name = name;
      this.rank = rank;
      this.days = days;
    }
  }
  add(element) {
    element.forEach((el) => {
      if (!this.unavailable.includes(el)) {
        this.unavailable.push(el);
      }
    });
    if (this.unavailable.length == 20) this.isRegular = false;
  }
}

let px병 = [10, 12, 16];
let 금일불침번 = [17, 18, 19, 20, 1, 2, 3, 4, 5, 6, 7];
let 전날불침번 = [8, 9, 10, 11, 12, 13];
let 취사지원 =
  상황병 =
  전역자 =
  분대장 =
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
let 휴가복귀자 = [19, 20, 1, 2, 3, 4, 5, 6, 7];

let 김동현 = new Person("김동현", 9, 500, 500);
let 황지원 = new Person("황지원", 9, 300, 250, 분대장);
let 신재영 = new Person("신재영", 9, 240, 230);
let 한동희 = new Person("한동희", 9, 240, 200);
let 함태규 = new Person("함태규", 9, 180, 150);
let 한지훈 = new Person("한지훈", 9, 150, 130);
let 최준석 = new Person("최준석", 9, 60, 70);

let 정유빈 = new Person("정유빈", 10, 450, 300);
let 이상현 = new Person("이상현", 10, 390, 300);
let 김준영 = new Person("김준영", 10, 360, 300);
let 김근우 = new Person("김근우", 10, 320, 300, 분대장);
let 이호현 = new Person("이호현", 10, 240, 200);
let 이효승 = new Person("이효승", 10, 220, 180);
let 유태은 = new Person("유태은", 10, 180, 150);
let 김동영 = new Person("김동영", 10, 150, 130);

let 오준하 = new Person("오준하", 11, 430,380,분대장);
let 이태경 = new Person("이태경", 11, 390, 300);
let 이동건 = new Person("이동건", 11, 430, 320);
let 최준영 = new Person("최준영", 11, 320, 280);
let 문재용 = new Person("문재용", 11, 180, 150);

let 주호연 = new Person("주호연", 0, 500, 1000, 상황병);
let 이준엽 = new Person("이준엽", 0, 500, 900, 상황병);
let 김가온 = new Person("김가온", 0, 540, 900);
let 김승민 = new Person("김승민", 0, 500, 900);
let 김태훈 = new Person("김태훈", 0, 360, 800, 상황병);
let 이정석 = new Person("이정석", 0, 180, 150);
let 신승원 = new Person("신승원", 0, 180, 150, px병);

let 강대현 = new Person("강대현", 0, 500, 800);
let 유지민 = new Person("유지민", 0, 480, 800, 상황병);
let 정성훈 = new Person("정성훈", 0, 480, 800, 상황병);
let 하태헌 = new Person("하태헌", 0, 360, 500);
let 김지원 = new Person("김지원", 0, 240, 200);

let 정민 = new Person("정민", 12, 450, 400);
let 정범수 = new Person("정범수", 12, 360, 380, 분대장);
let 박대용 = new Person("박대용", 12, 180, 170);
let 장윤재 = new Person("장윤재", 12, 180, 150);
let 송찬민 = new Person("송찬민", 12, 60, 50);

let 권찬호 = new Person("권찬호", 12, 450, 500, 분대장);
let 이우제 = new Person("이우제", 12, 360, 330);
let 심재석 = new Person("심재석", 12, 220, 180);
let 서원형 = new Person("서원형", 12, 160, 160);
let 유호재 = new Person("유호재", 12, 60, 50);

arr = [
  김동현,
  황지원,
  신재영,
  한동희,
  함태규,
  한지훈,
  최준석,
  정유빈,
  이상현,
  김준영,
  김근우,
  이호현,
  이효승,
  유태은,
  김동영,
  오준하,
  이태경,
  이동건,
  최준영,
  문재용,
  주호연,
  이준엽,
  김가온,
  김승민,
  김태훈,
  이정석,
  신승원,
  강대현,
  유지민,
  정성훈,
  하태헌,
  김지원,
  정민,
  정범수,
  박대용,
  장윤재,
  유호재,
  권찬호,
  이우제,
  서원형,
  심재석,
  송찬민,
];

let daypassed=0;
// 근무일수 누산기
(function() {
  arr.forEach((element)=>{
    element.days += daypassed;
  });
})();

module.exports = {
  arr,
  Person,
  취사지원,
  전날불침번,
  금일불침번,
  상황병,
  휴가복귀자,
  전역자,
  분대장,
};

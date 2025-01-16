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
} from "./workers.mjs";
import { std } from 'mathjs';

// 임의 설정
let 전날7번근무자=[arr["정민"],arr["문재용"],arr["박대용"]];

// 일반근무자 필터링
const regulars = arr.filter((object) => object.isRegular === true);

// 기본 설정
let nightTimeline;
const numEmployees = regulars.length; // 직원 수
const numShifts = 8; // 시간대 수
const employeesPerShift = 2; // 각 시간대에 필요한 직원 수
const maxShiftsPerEmployee = 1; // 각 직원이 최대 근무할 수 있는 횟수
const generations = 10; // 유전 알고리즘 세대 수
const mutationRate = 0.05; // 돌연변이 확률

/* 
필요인원이 근무자 수를 초과할 때 에러 배출
*/
if(numEmployees<numShifts*employeesPerShift) {
  throw new Error("야간근무자 부족합니다.");
}

// 초기 해를 생성 (랜덤으로 초기 근무표 생성, 제약 조건을 만족시키도록 설계)
function generateInitialPopulation(popSize) {
  const population = [];
  for (let p = 0; p < popSize; p++) {
    const individual = Array.from({ length: numShifts }, () => []); // 시간대 배열 초기화

    // 직원 배정 (연속 근무 제한을 고려)
    const assignedShifts = Array(numEmployees).fill(0); // 각 직원의 근무 횟수 기록
    for (let shift = 0; shift < numShifts; shift++) {
      const availableEmployees = Array.from(
        { length: numEmployees },
        (_, idx) => idx
      ).filter(
        (emp) =>
          assignedShifts[emp] < maxShiftsPerEmployee &&
          (shift === 0 || !individual[shift - 1].includes(emp)) &&
          !regulars[emp].unavailable.some(element => [20,1,2,3,4,5,6,7].includes(element))
      );

      // 시간대에 직원 배정
      for (let i = 0; i < employeesPerShift; i++) {
        if (availableEmployees.length === 0) break;
        const randomIdx = Math.floor(Math.random() * availableEmployees.length);
        const selectedEmployee = availableEmployees.splice(randomIdx, 1)[0];
        individual[shift].push(selectedEmployee);
        assignedShifts[selectedEmployee]++;
      }
    }

    population.push(individual);
  }
  return population;
}

// 적합도 평가 함수
function evaluateFitness(individual) {
  let fitness = 10000;

  // 시간대별 근무자 수 확인
  for (let shift = 0; shift < numShifts; shift++) {
    if (individual[shift].length !== employeesPerShift) {
      fitness -= 2000; // 근무자 수 부족 시 페널티
    }

    // 개인별 근무불가시간대 투입여부 확인 (투입되었을 경우 큰 패널티 부과)
    let illegal=false;
    individual[shift].forEach(element => {
      // 불침번이 저녁시간 투입시 패널티
      if(regulars[element].unavailable.includes(20) || regulars[element].unavailable.includes(shift) || regulars[element].unavailable.some(value => 금일불침번.includes(value))) illegal=true;
    });
    if(illegal) fitness -= 1000;
  }

  // 복무일수대비근무투입수 가중치 계산
  individual = individual.flat(2);
  let ratioScore = 0;
  let raioArray = individual.map(function(element) {
    // generation 세대 수 50이면 에러발생..? WHY
    return (regulars[element].rank + 1) / regulars[element].days;
  })
  ratioScore = std(raioArray);
  ratioScore = 1 / ratioScore;
  fitness += ratioScore;

  return fitness;
}

// 부모 선택 (루렛 휠 선택)
function selectParent(population) {
  const totalFitness = population.reduce(
    (acc, individual) => acc + evaluateFitness(individual),
    0
  );

  let rand = Math.random() * totalFitness;
  let partialSum = 0;

  for (const individual of population) {
    partialSum += evaluateFitness(individual);
    if (partialSum >= rand) {
      return individual;
    }
  }
}

// 교배 (단일 점 교차)
function crossover(parent1, parent2) {
  const crossoverPoint = Math.floor(Math.random() * numShifts);
  const child = [];

  for (let i = 0; i < numShifts; i++) {
    if (i < crossoverPoint) {
      child.push([...parent1[i]]);
    } else {
      child.push([...parent2[i]]);
    }
  }

  return child;
}

// 돌연변이 (랜덤으로 시간대 변경)
// 근무자 1인을 아무 근무가능자와 교체하는 것이 아닌 해당 해 내에 있는 근무자와 바꿔준다. (1인 1근무 조건 성립 위함)
function mutate(individual) {
  // 두 임의의 시간대와 직원 인덱스를 선택하여 교환
  if (Math.random() < mutationRate) {
    // 임의의 두 시간대를 선택
    const shift1 = Math.floor(Math.random() * numShifts);
    const shift2 = Math.floor(Math.random() * numShifts);

    // 두 시간대에서 각각 임의의 직원을 선택
    const empIndex1 = Math.floor(Math.random() * individual[shift1].length);
    const empIndex2 = Math.floor(Math.random() * individual[shift2].length);

    // 교환할 직원들
    const temp = individual[shift1][empIndex1];
    individual[shift1][empIndex1] = individual[shift2][empIndex2];
    individual[shift2][empIndex2] = temp;
  }
}

function runGeneticAlgorithmNight(popSize) {
  let bestcase;
  let population = generateInitialPopulation(popSize);

  for (let gen = 0; gen < generations; gen++) {
    const newPopulation = [];
    for (let i = 0; i < popSize; i++) {
      const parent1 = selectParent(population);
      mutate(parent1);
      newPopulation.push(parent1);
    }

    population = newPopulation;

    let bestIndividual = population[0];
    let bestFitness = evaluateFitness(bestIndividual);

    for (let i = 1; i < popSize; i++) {
      const fitness = evaluateFitness(population[i]);
      if (fitness > bestFitness) {
        bestFitness = fitness;
        bestcase = bestIndividual = population[i];
      }
    }

    // 7번근무자 1명추가배치
    let flatted = bestcase.flat(1);
    const availableEmployees = Array.from(
      { length: numEmployees },
      (_, idx) => idx
    ).filter(
      (emp) =>
        !regulars[emp].unavailable.includes(7) &&
        !flatted.includes(emp)
    );
    let random = Math.floor(Math.random() * availableEmployees.length);
    let selected = availableEmployees[random];
    bestcase.push(selected);

    console.log(
      `Generation ${
        gen + 1
      }: Best Fitness = ${bestFitness} Best Individual = ${bestcase}`
    );
  }

  bestcase=bestcase.flat(2);
  bestcase.forEach((e)=>{
    let a = arr.find(person => person.name===regulars[e].name)
    a.count++;
  })
  nightTimeline=bestcase=bestcase.map(index => regulars[index].name);
  console.log(bestcase);
}

// (function() {
//   runGeneticAlgorithmNight(100);
// })();

export { runGeneticAlgorithmNight, nightTimeline }
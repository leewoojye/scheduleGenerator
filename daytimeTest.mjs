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
let dayTimeline;
const numEmployees = regulars.length; // 직원 수
const numShifts = 7; // 시간대 수
const employeesPerShift = 3; // 각 시간대에 필요한 직원 수
const maxShiftsPerEmployee = 3; // 각 직원이 최대 근무할 수 있는 횟수
const generations = 10; // 유전 알고리즘 세대 수
const mutationRate = 0.05; // 돌연변이 확률
const maxShiftsPerDay = 3; // 하루 동안 투입가능한 최대횟수

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
          (shift === 0 || !individual[shift - 1].includes(emp)) // 연속 근무 방지 
          && (assignedShifts[emp]+regulars[emp].count <= maxShiftsPerDay) // 하루 중 최대근무횟수제한
          // 하루최대근무투입횟수를 여기서 제한해도 교배하면 지켜지지 않을 수도 있음...
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

    // 연속 근무 여부 확인
    if (shift > 0) {
      for (const emp of individual[shift]) {
        if (individual[shift - 1].includes(emp)) {
          fitness -= 1000; // 연속 근무 시 페널티
        }
      }
    }
    // 개인별 근무불가시간대 투입여부 확인 (투입되었을 경우 큰 패널티 부과)
    let illegal=false;
    individual[shift].forEach(element => {
      // index는 0부터 시작하는 것과 달리 근무시간대 번호는 위에서 8부터 시작해 shift+8의 값과 비교해주어야 한다.
      if(regulars[element].unavailable.includes(shift+8)) illegal=true;
    });
    if(illegal) fitness -= 1000;
  }

  individual = individual.flat(2);
  // 복무일수대비근무투입수 가중치 계산
  let ratioScore = 0;
  let raioArray = individual.map(function(element) {
    return (regulars[element].rank+1) / regulars[element].days;
  })
  ratioScore = std(raioArray);
  ratioScore = 1 / ratioScore;
  fitness += ratioScore;

  // 개인별 근무투입횟수 표준편차 최소화
  let countArray = individual.map(function(element) {
    return regulars[element].count;
  })
  let countScore = std(countArray)
  fitness += countScore/10;

  // 개인별 하루최대근무횟수 초과시 패널티
  let illegal2 = false;
  individual.forEach((e)=>{
    const count = individual.filter(el => el==e).length;
    if(count+regulars[e].count>maxShiftsPerDay) illegal2 = true;
  })
  // 너무 안지켜져서 값확 올림...
  if(illegal2) fitness -= 10000;

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
function mutate(individual) {
  for (let shift = 0; shift < numShifts; shift++) {
    if (Math.random() < mutationRate) {
      const empToReplace = Math.floor(Math.random() * employeesPerShift);
      const availableEmployees = Array.from(
        { length: numEmployees },
        (_, idx) => idx
      ).filter(
        (emp) =>
          !individual[shift].includes(emp) &&
          (shift === 0 || !individual[shift - 1].includes(emp)) &&
          (shift === numShifts - 1 || !individual[shift + 1].includes(emp)) && (regulars[emp].count<maxShiftsPerDay)
      );

      if (availableEmployees.length > 0) {
        individual[shift][empToReplace] =
          availableEmployees[
            Math.floor(Math.random() * availableEmployees.length)
          ];
      }
    }
  }
}

function runGeneticAlgorithmDay(popSize) {
  let bestcase;
  let population = generateInitialPopulation(popSize);

  for (let gen = 0; gen < generations; gen++) {
    const newPopulation = [];
    for (let i = 0; i < popSize; i++) {
      const parent1 = selectParent(population);
      const parent2 = selectParent(population);
      let child = crossover(parent1, parent2);
      // mutate(parent1);
      // newPopulation.push(parent1);
      mutate(child);
      newPopulation.push(child);
    }

    population = newPopulation;

    let bestIndividual = population[0];
    let bestFitness = evaluateFitness(bestIndividual);

    for (let i = 1; i < popSize; i++) {
      const fitness = evaluateFitness(population[i]);
      if (fitness > bestFitness) {
        bestFitness = fitness;
        bestcase=bestIndividual = population[i];
      }
    }

    console.log(
      `Generation ${
        gen + 1
      }: Best Fitness = ${bestFitness} Best Individual = ${bestIndividual}`
    );
  }

  bestcase=bestcase.flat(2);
  bestcase.forEach((e)=>{
    let a = arr.find(person => person.name===regulars[e].name)
    a.count++;
  })
  dayTimeline=bestcase=bestcase.map(index => regulars[index].name);
  console.log(bestcase);
}

// 메인함수
// (function() {
//   runGeneticAlgorithm(100);
// })();

export { runGeneticAlgorithmDay, dayTimeline };
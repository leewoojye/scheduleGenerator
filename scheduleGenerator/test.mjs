// import {
//   arr,
//   Person,
//   취사지원,
//   전날불침번,
//   금일불침번,
//   상황병,
//   휴가복귀자,
//   전역자,
//   분대장,
// } from "./workers.js";

// const regulars = arr.filter((object) => object.isRegular === true);

// 기본 설정
// const numEmployees = regulars.length; // 직원 수
const numEmployees = 15;
const numShifts = 7; // 시간대 수
const maxShiftsPerEmployee = 3; // 최대 근무 횟수
const generations = 1000; // 세대 수
const mutationRate = 0.05; // 돌연변이 확률

// 근무 점수 (랜덤 예시, 각 직원이 각 시간대에 근무했을 때 얻는 점수)
const scores = Array.from({ length: numEmployees }, () =>
  Array.from({ length: numShifts }, () => Math.floor(Math.random() * 10))
);

// 초기 해를 생성 (랜덤으로 초기 근무표 생성)
function generateInitialPopulation(popSize) {
  const population = [];
  for (let i = 0; i < popSize; i++) {
    const individual = Array.from({ length: numEmployees }, () =>
      Array.from({ length: numShifts }, () => Math.floor(Math.random() * 2))
    );
    population.push(individual);
  }
  return population;
}

// 적합도 평가 함수 (각 개체의 점수를 합산하여 평가)
function evaluateFitness(individual) {
  let fitness = 10000;
  const shiftCounts = Array(numShifts).fill(0);

  for (let i = 0; i < numEmployees; i++) {
    let shiftsAssigned = 0;
    for (let j = 0; j < numShifts; j++) {
      if (individual[i][j] === 1) {
        fitness += scores[i][j]; // 해당 직원의 근무 점수 추가
        shiftCounts[j]++; // 해당 시간대 근무자 수 증가
        shiftsAssigned++;
      }
    }

    // 각 사람은 최대 3번까지 근무 가능
    if (shiftsAssigned > maxShiftsPerEmployee) {
      fitness -= 1000; // 제한 초과 시 큰 페널티
    }
  }

  // 각 시간대에 3명이 아니면 패널티 부과
  for (let j = 0; j < numShifts; j++) {
    if (shiftCounts[j] !== 3) {
      fitness -= 1000;
    }
  }
  // for (let j = 0; j < numShifts; j += 3) {
  //   set = new Set([]);
  //   if (shiftCounts[j] !== 3) {
  //     fitness -= 1000;
  //   }
  // }

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

// 교배 (단일 점에서 교차)
function crossover(parent1, parent2) {
  const crossoverPoint = Math.floor(Math.random() * numEmployees);
  const child = [];

  for (let i = 0; i < numEmployees; i++) {
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
  for (let i = 0; i < numEmployees; i++) {
    for (let j = 0; j < numShifts; j++) {
      if (Math.random() < mutationRate) {
        individual[i][j] = 1 - individual[i][j]; // 0을 1로, 1을 0으로 변경
      }
    }
  }
}

// 유전 알고리즘 실행
function runGeneticAlgorithm(popSize) {
  let population = generateInitialPopulation(popSize);

  for (let gen = 0; gen < generations; gen++) {
    // 적합도 평가 및 선택
    const newPopulation = [];
    for (let i = 0; i < popSize; i++) {
      const parent1 = selectParent(population);
      const parent2 = selectParent(population);
      let child = crossover(parent1, parent2);
      mutate(child); // 돌연변이 적용
      newPopulation.push(child);
    }

    population = newPopulation;

    // 가장 적합한 해를 찾기
    let bestIndividual = population[0];
    let bestFitness = evaluateFitness(bestIndividual);

    for (let i = 1; i < popSize; i++) {
      const fitness = evaluateFitness(population[i]);
      if (fitness > bestFitness) {
        bestFitness = fitness;
        bestIndividual = population[i];
      }
    }

    console.log(`Generation ${gen + 1}: Best Fitness = ${bestFitness}`);
  }
  console.log(population);
  return population;
}

// 실행
runGeneticAlgorithm(100); // 100개의 개체로 유전 알고리즘 실행

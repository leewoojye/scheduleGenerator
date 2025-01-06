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

const regulars = arr.filter((object) => object.isRegular === true);

// 기본 설정
// const numEmployees = regulars.length; // 직원 수
const numEmployees = regulars.length; // 직원 수
const numShifts = 7; // 시간대 수
const employeesPerShift = 3; // 각 시간대에 필요한 직원 수
const maxShiftsPerEmployee = 3; // 각 직원이 최대 근무할 수 있는 횟수
const generations = 1000; // 유전 알고리즘 세대 수
const mutationRate = 0.05; // 돌연변이 확률

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

// 적합도 평가 함수 (연속 근무 시 페널티 부과)
function evaluateFitness(individual) {
  let fitness = 10000;

  // 시간대별 근무자 수 확인
  for (let shift = 0; shift < numShifts; shift++) {
    if (individual[shift].length !== employeesPerShift) {
      fitness -= 1000; // 근무자 수 부족 시 페널티
    }

    // 연속 근무 여부 확인
    if (shift > 0) {
      for (const emp of individual[shift]) {
        if (individual[shift - 1].includes(emp)) {
          fitness -= 500; // 연속 근무 시 페널티
        }
      }
    }
  }

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
          (shift === numShifts - 1 || !individual[shift + 1].includes(emp))
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

// 유전 알고리즘 실행
function runGeneticAlgorithm(popSize) {
  let population = generateInitialPopulation(popSize);

  for (let gen = 0; gen < generations; gen++) {
    const newPopulation = [];
    for (let i = 0; i < popSize; i++) {
      const parent1 = selectParent(population);
      const parent2 = selectParent(population);
      let child = crossover(parent1, parent2);
      mutate(child);
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

    console.log(
      `Generation ${
        gen + 1
      }: Best Fitness = ${bestFitness} Best Individual = ${bestIndividual}`
    );
  }
}

// 실행
runGeneticAlgorithm(100); // 100개의 개체로 유전 알고리즘 실행
console.log(regulars);
console.log(regulars.length);

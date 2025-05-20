import { initializeGroups } from './initializeGroupingAlgorithm';
import Student from './student.object';
import { standardDeviation } from 'simple-statistics';

const MUTATION_RATE = 0.5;
const GENERATIONS = 180;

export function geneticAlgorithm(
  students: Student[],
  numberOfGroups: number
): Student[][] {
  const population = generateInitialPopulation(students, numberOfGroups);
  const fitnessScores = calculateFitness(population);
  for (let i = 0; i < GENERATIONS; i++) {
    const { parent1, parent2 } = selection(population, fitnessScores);
    if (!parent1 || !parent2) {
      continue;
    }
    const child = crossover(parent1, parent2);
    mutate(child);

    updatePopulation(population, fitnessScores, child);
  }
  const bestIndex = fitnessScores.indexOf(Math.max(...fitnessScores));
  return population[bestIndex];
}

function generateInitialPopulation(
  students: Student[],
  numberOfGroups: number
): Student[][][] {
  const population: Student[][][] = [];
  for (let i = 0; i < numberOfGroups; i++) {
    const groups = initializeGroups(students, numberOfGroups);
    population.push(groups);
  }
  return population;
}

function calculateFitness(population: Student[][][]) {
  const fitnessScores: number[] = [];
  for (const groups of population) {
    const fitnessScore = calculateDiversity(groups);
    fitnessScores.push(fitnessScore);
  }
  return fitnessScores;
}

function calculateDiversity(groups: Student[][]): number {
  const groupDiversity: number[] = [];
  let preferenceScore: number = 0;

  for (const group of groups) {
    const scores: number[] = group.map((student) => student.getScore());
    if (scores.length > 1) {
      groupDiversity.push(standardDeviation(scores));
    } else {
      groupDiversity.push(0);
    }

    for (const student of group) {
      for (const preference of student.preferences) {
        if (group.some((s) => s.id === preference)) {
          preferenceScore += 1;
        }
      }
    }
  }
  const meanDiversity =
    groupDiversity.reduce((a, b) => a + b, 0) / groupDiversity.length;
  const diversityVariance =
    groupDiversity.length > 1 ? standardDeviation(groupDiversity) : 0;

  return meanDiversity + preferenceScore - diversityVariance;
}

function selection(
  population: Student[][][],
  fitnessScores: number[]
): { parent1: Student[][] | null; parent2: Student[][] | null } {
  const n = fitnessScores.length;
  if (n === 0) return { parent1: null, parent2: null };
  if (n === 1) return { parent1: population[0], parent2: population[0] };

  let index1 = 0;
  let index2 = 1;

  if (fitnessScores[index2] > fitnessScores[index1]) {
    [index1, index2] = [index2, index1];
  }

  for (let i = 2; i < n; i++) {
    if (fitnessScores[i] > fitnessScores[index1]) {
      index2 = index1;
      index1 = i;
    } else if (fitnessScores[i] > fitnessScores[index2]) {
      index2 = i;
    }
  }

  return { parent1: population[index1], parent2: population[index2] };
}

function crossover(parent1: Student[][], parent2: Student[][]): Student[][] {
  const allStudents = new Map<number, Student>();
  for (const group of [...parent1, ...parent2]) {
    for (const student of group) {
      allStudents.set(student.id, student);
    }
  }

  const child: Student[][] = parent1.map((group) => group.slice());

  const assignedStudents = new Set<number>();
  for (const group of child) {
    for (const student of group) {
      assignedStudents.add(student.id);
    }
  }

  for (const group of parent2) {
    for (const student of group) {
      if (!assignedStudents.has(student.id)) {
        const smallestGroup = child.reduce((minGroup, currentGroup) =>
          currentGroup.length < minGroup.length ? currentGroup : minGroup
        );
        smallestGroup.push(student);
        assignedStudents.add(student.id);
      }
    }
  }

  for (const [studentId, student] of allStudents) {
    if (!assignedStudents.has(studentId)) {
      const smallestGroup = child.reduce((minGroup, currentGroup) =>
        currentGroup.length < minGroup.length ? currentGroup : minGroup
      );
      smallestGroup.push(student);
      assignedStudents.add(studentId);
    }
  }

  return child;
}

function mutate(child: Student[][]): void {
  if (Math.random() < MUTATION_RATE) {
    const i = Math.floor(Math.random() * child.length);
    let j = Math.floor(Math.random() * child.length);

    while (j === i) {
      j = Math.floor(Math.random() * child.length);
    }

    if (child[i].length && child[j].length) {
      const s1 = child[i][Math.floor(Math.random() * child[i].length)];
      const s2 = child[j][Math.floor(Math.random() * child[j].length)];

      child[i] = child[i].filter((s) => s !== s1);
      child[j] = child[j].filter((s) => s !== s2);

      child[i].push(s2);
      child[j].push(s1);
    }
  }
}

function updatePopulation(
  population: Student[][][],
  fitnessScores: number[],
  child: Student[][]
): void {
  const childFitness = calculateDiversity(child);
  const worstIndex = fitnessScores.indexOf(Math.min(...fitnessScores));
  if (childFitness > fitnessScores[worstIndex]) {
    population[worstIndex] = child;
    fitnessScores[worstIndex] = childFitness;
  }
}

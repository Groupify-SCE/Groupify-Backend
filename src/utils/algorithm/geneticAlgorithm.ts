import { crossover } from './crossover';
import { calculatePopulationFitness } from './fitness';
import { generateInitialPopulation } from './initializeGroupingAlgorithm';
import { mutate } from './mutate';
import { selection } from './selection';
import Student from './student.object';
import { updatePopulation } from './updatePopulation';

const GENERATIONS = 180;
const MUTATION_RATE = 0.5;

export function geneticAlgorithmWithPreferences(
  students: Student[],
  numGroups: number
): Student[][] {
  // 1) initial population
  const population = generateInitialPopulation(students, numGroups);
  // 2) fitness scores
  let fitnessScores = calculatePopulationFitness(population);

  // trivial 1‐group case
  if (numGroups === 1) {
    return population[0];
  }

  // 3) main loop
  for (let gen = 0; gen < GENERATIONS; gen++) {
    const [parent1, parent2] = selection(population, fitnessScores);
    const child = crossover(parent1, parent2);
    const mutated = mutate(child, MUTATION_RATE);

    updatePopulation(population, fitnessScores, mutated);

    // re‐compute fitness to keep in sync
    fitnessScores = calculatePopulationFitness(population);
  }

  // 4) return best
  const bestIdx = fitnessScores.indexOf(Math.max(...fitnessScores));
  return population[bestIdx];
}

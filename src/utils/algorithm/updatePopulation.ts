import { calculateDiversity } from './fitness';
import Student from './student.object';

/**
 * Replace the worst solution in the population with the new child
 * if (and only if) the child's fitness is higher.
 *
 * @param population     – Array of solutions (each is Student[][])
 * @param fitnessScores  – Parallel array of fitness numbers
 * @param child          – A newly generated solution (Student[][])
 */
export function updatePopulation(
  population: Student[][][],
  fitnessScores: number[],
  child: Student[][]
): void {
  // 1) Compute child's fitness
  const childFitness = calculateDiversity(child);

  // 2) Find the index of the worst‐scoring solution
  const worstIndex = fitnessScores.indexOf(Math.min(...fitnessScores));

  // 3) If our child is strictly better, replace the worst solution
  if (childFitness > fitnessScores[worstIndex]) {
    population[worstIndex] = child;
    fitnessScores[worstIndex] = childFitness;
  }
}

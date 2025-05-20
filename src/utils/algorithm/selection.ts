import Student from './student.object';

/**
 * Selects the top two solutions (parents) from the population according to their fitness scores.
 * Always returns a tuple [parent1, parent2].
 *
 * @param population     – Array of candidate solutions; each solution is an array of groups (Student[][]).
 * @param fitnessScores  – Array of fitness scores, same length as population.
 * @returns              – A 2-element tuple: [bestSolution, secondBestSolution].
 */
export function selection(
  population: Student[][][],
  fitnessScores: number[]
): [Student[][], Student[][]] {
  const n = fitnessScores.length;

  if (n === 0) {
    throw new Error('Cannot select parents from an empty population');
  }

  // If there's only one candidate, return it twice
  if (n === 1) {
    return [population[0], population[0]];
  }

  // Build an array of { index, score }, sort descending by score
  const sorted = fitnessScores
    .map((score, idx) => ({ score, idx }))
    .sort((a, b) => b.score - a.score);

  const bestIdx = sorted[0].idx;
  const secondIdx = sorted[1].idx;

  const parent1 = population[bestIdx];
  const parent2 = population[secondIdx];

  return [parent1, parent2];
}

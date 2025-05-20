import Student from './student.object';

/** Compute the arithmetic mean of an array (empty ⇒ 0) */
function mean(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((sum, x) => sum + x, 0) / arr.length;
}

/** Sample standard deviation (N−1 in denominator). If length<2 ⇒ 0 */
function standardDeviation(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const variance =
    arr.reduce((sum, x) => sum + (x - m) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

/**
 * Exactly your Python calculate_diversity:
 *  1) For each group, build scores[]:
 *     - if experiment, do pairwise getScore(student1, student2)
 *     - else do solo getScore()
 *  2) Compute stdev(scores) or 0 if only one score
 *  3) Tally +1 in preference_score for every student whose preference
 *     appears in the same group
 *  4) total = mean(group_diversities) + preference_score - stdev(group_diversities)
 */
export function calculateDiversity(groups: Student[][]): number {
  const groupDiversities: number[] = [];
  let preferenceScore = 0;

  for (const group of groups) {
    // 1) build “scores” array
    let scores: number[] = [];
    if (group.length) {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          scores.push(group[i].getScore());
        }
      }
    } else {
      scores = group.map((s) => s.getScore());
    }

    // 2) diversity = stdev(scores) or 0
    const diversity = standardDeviation(scores);
    groupDiversities.push(diversity);

    // 3) count preference hits
    for (const student of group) {
      if (
        student.preferences.some((prefId: string) =>
          group.some((s) => s.id === prefId)
        )
      ) {
        preferenceScore += 1;
      }
    }
  }

  // 4) mean diversity
  const meanDiv = mean(groupDiversities);

  // 5) variance penalty = stdev(groupDiversities)
  const variancePenalty = standardDeviation(groupDiversities);

  // total score
  return meanDiv + preferenceScore - variancePenalty;
}

/**
 * Given a population of “solutions” (each solution is an array of groups,
 * each group is an array of Students), return one fitness score per solution.
 */
export function calculatePopulationFitness(
  population: Student[][][]
): number[] {
  return population.map((groups) => calculateDiversity(groups));
}

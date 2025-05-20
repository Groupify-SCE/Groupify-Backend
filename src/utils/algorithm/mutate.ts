import Student from './student.object';

/**
 * With probability = mutationRate, pick two distinct groups at random,
 * then pick one random student from each and swap them.
 * Returns the (possibly) mutated groups array.
 *
 * @param groups        – an array of groups (each group is Student[])
 * @param mutationRate  – a number in [0,1]
 */
export function mutate(groups: Student[][], mutationRate: number): Student[][] {
  // Decide whether to mutate
  if (Math.random() < mutationRate) {
    const numGroups = groups.length;
    if (numGroups < 2) {
      return groups; // need at least two groups to swap
    }

    // Pick two distinct group indices
    let g1 = Math.floor(Math.random() * numGroups);
    let g2 = Math.floor(Math.random() * numGroups);
    while (g2 === g1) {
      g2 = Math.floor(Math.random() * numGroups);
    }

    const group1 = groups[g1];
    const group2 = groups[g2];
    if (group1.length > 0 && group2.length > 0) {
      // Pick a random student from each group
      const i1 = Math.floor(Math.random() * group1.length);
      const i2 = Math.floor(Math.random() * group2.length);

      // Swap them
      const temp = group1[i1];
      group1[i1] = group2[i2];
      group2[i2] = temp;
    }
  }

  return groups;
}

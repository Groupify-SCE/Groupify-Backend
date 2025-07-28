import Student from './student.object';

/**
 * Perform crossover between two parent solutions to produce a child solution.
 * Ensures every student appears exactly once.
 *
 * @param parent1 – First parent solution (array of groups)
 * @param parent2 – Second parent solution
 * @returns A new child solution: an array of groups of Students
 */
export function crossover(
  parent1: Student[][],
  parent2: Student[][]
): Student[][] {
  // 1) Build a map of all students by ID
  const allStudents: Record<string, Student> = {};
  for (const grp of [...parent1, ...parent2]) {
    for (const s of grp) {
      allStudents[s.id] = s;
    }
  }

  // 2) Start child by cloning parent1’s grouping
  const child = parent1.map((group) => [...group]);

  // 3) Track which IDs have already been assigned
  const assigned = new Set<string>();
  for (const grp of child) {
    for (const s of grp) {
      assigned.add(s.id);
    }
  }

  // 4) Pull in any missing students from parent2
  for (const grp of parent2) {
    for (const s of grp) {
      if (!assigned.has(s.id)) {
        // find the currently smallest group in child
        const smallest = child.reduce(
          (min, cur) => (cur.length < min.length ? cur : min),
          child[0]
        );
        smallest.push(s);
        assigned.add(s.id);
      }
    }
  }

  // 5) Finally, if any still remain (just in case), append them too
  const remainingIds = Object.keys(allStudents).filter(
    (id) => !assigned.has(id)
  );
  for (const id of remainingIds) {
    const smallest = child.reduce(
      (min, cur) => (cur.length < min.length ? cur : min),
      child[0]
    );
    smallest.push(allStudents[id]);
    assigned.add(id);
  }

  return child;
}

import Student from './student.object';

type Color = 'White' | 'Gray' | 'Black' | 'Red';

class Node {
  public data: string;
  public student: Student;
  public neighbors: Node[] = [];
  public d: number | null = null;
  public f: number | null = null;
  public pie: Node | null = null;
  public color: Color = 'White';

  constructor(data: string, student: Student) {
    this.data = data;
    this.student = student;
  }
}

// Fisher–Yates shuffle
function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function DFS(nodes: Record<string, Node>): void {
  let time = 0;

  function visit(u: Node): void {
    u.color = 'Gray';
    time++;
    u.d = time;
    for (const v of u.neighbors) {
      if (v.color === 'White') {
        v.pie = u;
        visit(v);
      }
    }
    time++;
    u.f = time;
    u.color = 'Black';
  }

  // init
  for (const n of Object.values(nodes)) {
    n.color = 'White';
    n.pie = null;
  }
  // run
  for (const n of Object.values(nodes)) {
    if (n.color === 'White') visit(n);
  }
}

function isValidGroup(group: Node[]): boolean {
  const s = new Set(group);
  return group.every((node) => node.neighbors.some((nbr) => s.has(nbr)));
}

function getGroup(
  node: Node,
  groupSize: number,
  partial: Node[] = [],
  depth = 0,
  limit = 100
): Node[] {
  if (depth > limit) return [];

  const current = [...partial, node];
  if (current.length === groupSize) {
    return isValidGroup(current) ? current : [];
  }
  for (const nbr of node.neighbors) {
    if (nbr.color !== 'Red' && !current.includes(nbr)) {
      const attempt = getGroup(nbr, groupSize, current, depth + 1, limit);
      if (attempt.length) return attempt;
    }
  }
  return [];
}

function groupUngroupedNodes(ungrouped: Node[], groupSize: number): Node[][] {
  const result: Node[][] = [];
  let rest = [...ungrouped];
  while (rest.length) {
    const grp = rest.slice(0, groupSize);
    grp.forEach((n) => (n.color = 'Red'));
    result.push(grp);
    rest = rest.slice(groupSize);
  }
  return result;
}

function dfsGrouping(students: Student[], numGroups: number): Node[][] {
  // 1) build nodes map
  const nodes: Record<string, Node> = {};
  for (const s of students) {
    nodes[s.id] = new Node(s.id, s);
  }
  // 2) link neighbors by preferences
  for (const s of students) {
    for (const prefId of s.preferences) {
      const nbr = nodes[prefId];
      if (nbr) nodes[s.id].neighbors.push(nbr);
    }
  }
  // 3) DFS timestamps
  DFS(nodes);

  // 4) queue ordered by descending discovery time
  const all = Object.values(nodes).sort((a, b) => (b.d ?? 0) - (a.d ?? 0));
  // 5) form groups
  const groups: Node[][] = [];
  const Q = all.slice(); // simple array as queue
  const n = students.length;
  const baseSize = Math.floor(n / numGroups);

  while (Q.length) {
    const u = Q.shift()!;
    if (u.color !== 'Red') {
      const grp = getGroup(u, baseSize, [], 0, n);
      if (grp.length) {
        grp.forEach((x) => (x.color = 'Red'));
        groups.push(grp);
      }
    }
  }

  // 6) fallback for leftovers
  const leftovers = Object.values(nodes).filter((x) => x.color !== 'Red');
  const maxGroupSize = baseSize + (n % numGroups ? 1 : 0);
  groups.push(...groupUngroupedNodes(leftovers, maxGroupSize));

  return groups;
}

/**
 * Shuffle students & apply preference‐based DFS grouping
 */
function initializeGroups(students: Student[], numGroups: number): Student[][] {
  shuffle(students);
  const nodeGroups = dfsGrouping(students, numGroups);
  return nodeGroups.map((grp) => grp.map((n) => n.student));
}

/**
 * Generate an initial population: an array of 'solutions',
 * each solution itself is a Student[][]
 */
export function generateInitialPopulation(
  students: Student[],
  numGroups: number
): Student[][][] {
  const pop: Student[][][] = [];
  for (let i = 0; i < numGroups; i++) {
    pop.push(initializeGroups(students, numGroups));
  }
  return pop;
}

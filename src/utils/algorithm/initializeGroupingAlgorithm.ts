import Student from './student.object';
import Denque from 'denque';

class Node {
  data: number;
  student: Student;
  neighbors: Node[];
  d: number | null;
  f: number | null;
  pie: Node | null;
  color: 'White' | 'Gray' | 'Black' | 'Red';

  constructor(data: number, student: Student) {
    this.data = data;
    this.student = student;
    this.neighbors = [];
    this.d = null;
    this.f = null;
    this.pie = null;
    this.color = 'White';
  }

  greaterThan(other: Node): boolean {
    return this.data > other.data;
  }

  lessThan(other: Node): boolean {
    return this.data < other.data;
  }

  equals(other: Node): boolean {
    return this.data === other.data;
  }
}

export function initializeGroups(
  students: Student[],
  numberOfGroups: number
): Student[][] {
  shuffle(students);
  const nodeGroups = dfsGrouping(students, numberOfGroups);
  const studentGroups = nodeGroups.map((group) =>
    group.map((node) => node.student)
  );
  return studentGroups;
}

function shuffle<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function dfsGrouping(students: Student[], numberOfGroups: number): Node[][] {
  const nodes: Record<number, Node> = students.reduce(
    (acc: Record<number, Node>, student) => {
      acc[student.id] = new Node(student.id, student);
      return acc;
    },
    {}
  );

  for (const student of students) {
    for (const preference of student.preferences) {
      if (nodes[preference]) {
        nodes[student.id].neighbors.push(nodes[preference]);
      }
    }
  }

  DFS(nodes);

  const sortedNodes = Object.values(nodes).sort((a, b) => {
    const dA = a.d != null ? (a.d as number) : 0;
    const dB = b.d != null ? (b.d as number) : 0;
    return dB - dA;
  });

  const Q = new Denque<Node>(sortedNodes);
  const groups: Node[][] = [];
  const n = Object.values(nodes).length;
  const targetSize = Math.floor(n / numberOfGroups);

  while (!Q.isEmpty()) {
    const currentNode = Q.pop();
    if (currentNode && currentNode.color !== 'Red') {
      const group = getGroup(currentNode, targetSize, n);
      if (group.length > 0) {
        group.forEach((node) => (node.color = 'Red'));
        groups.push(group);
      }
    }
  }

  const ungroupedNodes = Object.values(nodes).filter(
    (node) => node.color !== 'Red'
  );
  const maxGroupSize = targetSize + (n % numberOfGroups != 0 ? 1 : 0);

  const ungroupedGroups = groupUngroupedNodes(ungroupedNodes, maxGroupSize);
  groups.concat(ungroupedGroups);

  return groups;
}

function DFS(nodes: Record<number, Node>): void {
  let time = 0;

  function DFSVisit(u: Node): void {
    u.color = 'Gray';
    time++;
    u.d = time;
    for (const v of u.neighbors) {
      if (v.color === 'White') {
        v.pie = u;
        DFSVisit(v);
      }
    }
    time++;
    u.f = time;
    u.color = 'Black';
  }

  for (const node of Object.values(nodes)) {
    if (node.color === 'White') {
      DFSVisit(node);
    }
  }
}

function getGroup(
  node: Node,
  targetSize: number,
  limit: number,
  depth: number = 0,
  partial: Node[] = []
): Node[] {
  if (depth > limit) return [];

  const currentGroup = partial.concat(node);

  if (currentGroup.length === targetSize) {
    if (isValidGroup(currentGroup)) {
      return currentGroup;
    } else {
      return [];
    }
  }

  for (const neighbor of node.neighbors) {
    if (neighbor.color !== 'Red' && !currentGroup.includes(neighbor)) {
      const result = getGroup(
        neighbor,
        targetSize,
        limit,
        depth + 1,
        currentGroup
      );
      if (result.length > 0) return result;
    }
  }
  return [];
}

function isValidGroup(group: Node[]): boolean {
  const groupSet = new Set(group);
  return group.every((node) =>
    node.neighbors.some((neighbor) => groupSet.has(neighbor))
  );
}

function groupUngroupedNodes(ungrouped: Node[], groupSize: number): Node[][] {
  const groups: Node[][] = [];
  while (ungrouped.length > 0) {
    const group = ungrouped.slice(0, groupSize);
    group.forEach((node) => (node.color = 'Red'));
    groups.push(group);
    ungrouped = ungrouped.slice(groupSize);
  }
  return groups;
}

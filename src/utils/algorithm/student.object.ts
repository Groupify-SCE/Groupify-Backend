import { Criteria, StudentData } from './types';

class Student {
  public readonly id: string;
  public readonly name: string;
  public readonly criteria: Criteria[];
  public readonly preferences: string[];

  constructor(student: StudentData) {
    this.id = student.id;
    this.name = student.name;
    this.criteria = student.criteria;
    this.preferences = student.preferences;
  }

  public getScore(): number {
    let totalScore = 0;
    for (const criteria of this.criteria) {
      switch (criteria.type) {
        case '0-1':
          totalScore += criteria.value * 100;
          break;
        case '0-10':
          totalScore += criteria.value * 10;
          break;
        case '0-100':
          totalScore += criteria.value;
          break;
      }
    }
    return totalScore;
  }
}

export default Student;

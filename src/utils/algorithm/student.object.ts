import { StudentData } from "./types";

class StudentObject {
  constructor(private readonly student: StudentData) {}

  public getScore(): number {
    let totalScore = 0;
    for (const criteria of this.student.criteria) {
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

  public getId(): number {
    return this.student.id;
  }

  public getName(): string {
    return this.student.name;
  }
}

export default StudentObject;


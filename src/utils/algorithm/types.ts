export type Criteria = {
  type: string;
  value: number;
};

export type StudentData = {
    id: number;
    name: string;
    preferences: number[];
    criteria: Criteria[];
}

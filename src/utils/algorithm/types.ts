export type Criteria = {
  type: string;
  value: number;
};

export type StudentData = {
  id: string;
  name: string;
  preferences: string[];
  criteria: Criteria[];
};

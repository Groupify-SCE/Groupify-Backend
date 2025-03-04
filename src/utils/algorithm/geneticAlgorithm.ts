import { initializeGroups } from "./initializeGroupingAlgorithm";
import Student from "./student.object";

const POPULATION_SIZE = 100;
const MUTATION_RATE = 0.5;
const GENERATIONS = 180

export function geneticAlgorithm(students: Student[], numberOfGroups: number){
    const population = generateInitialPopulation(students, numberOfGroups);
}

function generateInitialPopulation(students: Student[], numberOfGroups: number): Student[][][] {
    let population: Student[][][] = [];
    for (let i = 0; i < POPULATION_SIZE; i++) {
        const groups = initializeGroups(students, numberOfGroups);
        population.push(groups);
    }
    return population;
}

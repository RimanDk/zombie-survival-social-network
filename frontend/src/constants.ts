// libs
import { v4 as uuid } from "uuid";

// internals
import { Item, Survivor } from "./types";

export const MOCK_POSSIBLE_ITEMS: Item[] = [
  {
    id: uuid(),
    label: "water",
    worth: 4,
  },
  {
    id: uuid(),
    label: "food",
    worth: 3,
  },
  {
    id: uuid(),
    label: "medication",
    worth: 2,
  },
  {
    id: uuid(),
    label: "ammunition",
    worth: 1,
  },
];

export const MOCK_SURVIVORS: Survivor[] = [
  {
    id: uuid(),
    name: "John Doe",
    age: 30,
    gender: "m",
    lastLocation: { id: "loc1", latitude: "34.0522", longitude: "-118.2437" },
    inventory: {
      [MOCK_POSSIBLE_ITEMS[0].id]: 2,
      [MOCK_POSSIBLE_ITEMS[1].id]: 1,
    },
    infectionReports: [],
  },
  {
    id: uuid(),
    name: "Jane Smith",
    age: 25,
    gender: "f",
    lastLocation: { id: "loc2", latitude: "40.7128", longitude: "-74.0060" },
    inventory: {
      [MOCK_POSSIBLE_ITEMS[2].id]: 2,
      [MOCK_POSSIBLE_ITEMS[3].id]: 1,
    },
    infectionReports: [],
  },
  {
    id: uuid(),
    name: "Alice Johnson",
    age: 28,
    gender: "f",
    lastLocation: { id: "loc3", latitude: "37.7749", longitude: "-122.4194" },
    inventory: {
      [MOCK_POSSIBLE_ITEMS[1].id]: 2,
      [MOCK_POSSIBLE_ITEMS[3].id]: 1,
    },
    infectionReports: [],
  },
  {
    id: uuid(),
    name: "Bob Brown",
    age: 35,
    gender: "m",
    lastLocation: { id: "loc4", latitude: "51.5074", longitude: "-0.1278" },
    inventory: {
      [MOCK_POSSIBLE_ITEMS[0].id]: 2,
      [MOCK_POSSIBLE_ITEMS[2].id]: 1,
    },
    infectionReports: [],
  },
  {
    id: uuid(),
    name: "Charlie Davis",
    age: 40,
    gender: "m",
    lastLocation: { id: "loc5", latitude: "48.8566", longitude: "2.3522" },
    inventory: {
      [MOCK_POSSIBLE_ITEMS[1].id]: 2,
      [MOCK_POSSIBLE_ITEMS[2].id]: 1,
    },
    infectionReports: [],
  },
  {
    id: uuid(),
    name: "Diana Evans",
    age: 22,
    gender: "f",
    lastLocation: { id: "loc6", latitude: "35.6895", longitude: "139.6917" },
    inventory: {
      [MOCK_POSSIBLE_ITEMS[0].id]: 2,
      [MOCK_POSSIBLE_ITEMS[3].id]: 1,
    },
    infectionReports: [],
  },
  {
    id: uuid(),
    name: "Ethan Foster",
    age: 27,
    gender: "m",
    lastLocation: { id: "loc7", latitude: "55.7558", longitude: "37.6173" },
    inventory: {
      [MOCK_POSSIBLE_ITEMS[1].id]: 2,
      [MOCK_POSSIBLE_ITEMS[2].id]: 1,
    },
    infectionReports: [],
  },
  {
    id: uuid(),
    name: "Fiona Green",
    age: 32,
    gender: "f",
    lastLocation: { id: "loc8", latitude: "39.9042", longitude: "116.4074" },
    inventory: {
      [MOCK_POSSIBLE_ITEMS[0].id]: 2,
      [MOCK_POSSIBLE_ITEMS[1].id]: 1,
    },
    infectionReports: [],
  },
  {
    id: uuid(),
    name: "George Harris",
    age: 29,
    gender: "m",
    lastLocation: { id: "loc9", latitude: "34.0522", longitude: "-118.2437" },
    inventory: {
      [MOCK_POSSIBLE_ITEMS[2].id]: 2,
      [MOCK_POSSIBLE_ITEMS[3].id]: 1,
    },
    infectionReports: [],
  },
  {
    id: uuid(),
    name: "Hannah Irving",
    age: 24,
    gender: "f",
    lastLocation: { id: "loc10", latitude: "40.7128", longitude: "-74.0060" },
    inventory: {
      [MOCK_POSSIBLE_ITEMS[1].id]: 2,
      [MOCK_POSSIBLE_ITEMS[3].id]: 1,
    },
    infectionReports: [],
  },
  {
    id: uuid(),
    name: "Ian Jackson",
    age: 31,
    gender: "m",
    lastLocation: { id: "loc11", latitude: "37.7749", longitude: "-122.4194" },
    inventory: {
      [MOCK_POSSIBLE_ITEMS[0].id]: 2,
      [MOCK_POSSIBLE_ITEMS[2].id]: 1,
    },
    infectionReports: [],
  },
  {
    id: uuid(),
    name: "Julia King",
    age: 26,
    gender: "f",
    lastLocation: { id: "loc12", latitude: "51.5074", longitude: "-0.1278" },
    inventory: {
      [MOCK_POSSIBLE_ITEMS[1].id]: 2,
      [MOCK_POSSIBLE_ITEMS[2].id]: 1,
    },
    infectionReports: [],
  },
  {
    id: uuid(),
    name: "Kevin Lewis",
    age: 33,
    gender: "m",
    lastLocation: { id: "loc13", latitude: "48.8566", longitude: "2.3522" },
    inventory: {
      [MOCK_POSSIBLE_ITEMS[0].id]: 2,
      [MOCK_POSSIBLE_ITEMS[3].id]: 1,
    },
    infectionReports: [],
  },
  {
    id: uuid(),
    name: "Laura Martinez",
    age: 21,
    gender: "f",
    lastLocation: { id: "loc14", latitude: "35.6895", longitude: "139.6917" },
    inventory: {
      [MOCK_POSSIBLE_ITEMS[1].id]: 2,
      [MOCK_POSSIBLE_ITEMS[2].id]: 1,
    },
    infectionReports: [],
  },
  {
    id: uuid(),
    name: "Michael Nelson",
    age: 34,
    gender: "m",
    lastLocation: { id: "loc15", latitude: "55.7558", longitude: "37.6173" },
    inventory: {
      [MOCK_POSSIBLE_ITEMS[0].id]: 2,
      [MOCK_POSSIBLE_ITEMS[1].id]: 1,
    },
    infectionReports: [],
  },
  {
    id: uuid(),
    name: "Nina Owens",
    age: 28,
    gender: "f",
    lastLocation: { id: "loc16", latitude: "39.9042", longitude: "116.4074" },
    inventory: {
      [MOCK_POSSIBLE_ITEMS[2].id]: 2,
      [MOCK_POSSIBLE_ITEMS[3].id]: 1,
    },
    infectionReports: [],
  },
  {
    id: uuid(),
    name: "Oscar Perez",
    age: 30,
    gender: "m",
    lastLocation: { id: "loc17", latitude: "34.0522", longitude: "-118.2437" },
    inventory: {
      [MOCK_POSSIBLE_ITEMS[1].id]: 2,
      [MOCK_POSSIBLE_ITEMS[3].id]: 1,
    },
    infectionReports: [],
  },
  {
    id: uuid(),
    name: "Paula Quinn",
    age: 27,
    gender: "f",
    lastLocation: { id: "loc18", latitude: "40.7128", longitude: "-74.0060" },
    inventory: {
      [MOCK_POSSIBLE_ITEMS[0].id]: 2,
      [MOCK_POSSIBLE_ITEMS[2].id]: 1,
    },
    infectionReports: [],
  },
  {
    id: uuid(),
    name: "Quincy Roberts",
    age: 32,
    gender: "m",
    lastLocation: { id: "loc19", latitude: "37.7749", longitude: "-122.4194" },
    inventory: {
      [MOCK_POSSIBLE_ITEMS[1].id]: 2,
      [MOCK_POSSIBLE_ITEMS[2].id]: 1,
    },
    infectionReports: [
      {
        id: "ir1",
        created: new Date(),
        reporter: "17",
      },
    ],
  },
  {
    id: uuid(),
    name: "Rachel Scott",
    age: 25,
    gender: "f",
    lastLocation: { id: "loc20", latitude: "51.5074", longitude: "-0.1278" },
    inventory: {
      [MOCK_POSSIBLE_ITEMS[0].id]: 2,
      [MOCK_POSSIBLE_ITEMS[3].id]: 1,
    },
    infectionReports: [],
  },
];

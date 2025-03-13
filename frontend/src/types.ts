export type LatLon = {
  id: string;
  lat: string;
  lon: string;
};

export type Item = {
  id: string;
  label: string;
  value: number;
};

export type InfectionReport = {
  id: string;
  created: Date;
  reportee: string;
};

export type Survivor = {
  id: string;
  name: string;
  age: number;
  gender: "m" | "f";
  lastLocation: LatLon;
  inventory: Item[];
  infectionReports: InfectionReport[];
};

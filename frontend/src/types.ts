export type LatLon = {
  id: string;
  lat: string;
  lon: string;
};

export type Item = {
  id: string;
  label: string;
  worth: number;
};

export type InfectionReport = {
  id: string;
  created: Date;
  reporter: string;
};

export type Survivor = {
  id: string;
  name: string;
  age: number;
  gender: "m" | "f";
  lastLocation: LatLon;
  inventory: string[];
  infectionReports: InfectionReport[];
};

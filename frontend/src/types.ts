export type Gender = "m" | "f";

export type LatLon = {
  id?: string;
  latitude: string;
  longitude: string;
};

export type Item = {
  id: string;
  label: string;
  worth: number;
};

export type InfectionReport = {
  id?: string;
  created: Date;
  reporter: string;
};

export type Inventory = Record<string, number>;

export type Survivor = {
  id?: string;
  name: string;
  age: number;
  gender: Gender;
  lastLocation: LatLon;
  inventory: Inventory;
  infectionReports?: InfectionReport[];
};

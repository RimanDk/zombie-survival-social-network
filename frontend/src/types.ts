export type Gender = "m" | "f";

export type LatLon = {
  id?: string;
  latitude: number;
  longitude: number;
  distance?: number;
};

export type Item = {
  id: string;
  label: string;
  worth: number;
};

export type InfectionReport = {
  id?: string;
  created_at: Date;
  reporter_id: Survivor["id"];
  reported_id: Survivor["id"];
};

export type Inventory = Record<Item["id"], number>;

export type Survivor = {
  id?: string;
  name: string;
  age: number;
  gender: Gender;
  lastLocation: LatLon;
  inventory: Inventory;
  infectionReports?: InfectionReport[];
};

export type ErrorState = { detail: string };

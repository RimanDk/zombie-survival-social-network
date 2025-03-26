export type Item = {
  id: string;
  label: string;
  worth: number;
};

export type Gender = "m" | "f";

export type LatLonBase = {
  latitude: number;
  longitude: number;
};
export type LatLon = LatLonBase & {
  id: string;
  distance: number;
};

export type InfectionReportBase = {
  created_at: Date;
  reporter_id: Survivor["id"];
  reported_id: Survivor["id"];
};
export type InfectionReport = InfectionReportBase & {
  id: string;
};

export type Inventory = Record<Item["id"], number>;

export type SurvivorBase = {
  name: string;
  age: number;
  gender: Gender;
  inventory: Inventory;
  lastLocation: LatLonBase;
};
export type Survivor = SurvivorBase & {
  id: string;
  infectionReports: InfectionReport[];
  lastLocation: LatLon;
};

export type ErrorState = { detail: string };

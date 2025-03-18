import { ErrorState, Survivor } from "../types";

export const isErrorState = (value?: object): value is ErrorState =>
  !!value && "detail" in value;

export const isSurvivor = (value?: object): value is Survivor =>
  !!value &&
  "name" in value &&
  "age" in value &&
  "gender" in value &&
  "lastLocation" in value &&
  "inventory" in value &&
  "infectionReports" in value;

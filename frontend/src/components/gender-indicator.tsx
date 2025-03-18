// libs
import { PiGenderFemaleBold, PiGenderMaleBold } from "react-icons/pi";

// interals
import { Gender } from "../types";

interface GenderIndicatorProps {
  gender: Gender;
}
export function GenderIndicator({ gender }: GenderIndicatorProps) {
  if (gender === "m") {
    return <PiGenderMaleBold className="text-lime-500" />;
  }
  return <PiGenderFemaleBold className="text-lime-500" />;
}

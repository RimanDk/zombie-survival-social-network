// libs
import { Button, IconButton } from "@radix-ui/themes";
import { IoMdInfinite } from "react-icons/io";
import { useSurvivorStore } from "../stores";

interface DistanceFilterProps {
  maxDistance: number | undefined;
  setMaxDistance: (distance: number | undefined) => void;
}
export function DistanceFilter({
  maxDistance,
  setMaxDistance,
}: DistanceFilterProps) {
  const myId = useSurvivorStore((state) => state.id);

  if (!myId) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-sm sm:block">Inside</span>
      {[1000, 5000, 10000, 25000, 50000].map((distance) => (
        <Button
          key={distance}
          size="1"
          color={maxDistance === distance ? "lime" : "gray"}
          onClick={() => setMaxDistance(distance)}
        >
          {distance / 1000}km
        </Button>
      ))}
      <IconButton
        size="1"
        color={!maxDistance ? "lime" : "gray"}
        onClick={() => setMaxDistance(undefined)}
      >
        <IoMdInfinite />
      </IconButton>
    </div>
  );
}

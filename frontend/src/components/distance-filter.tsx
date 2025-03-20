// libs
import { Button, IconButton } from "@radix-ui/themes";
import { IoMdInfinite } from "react-icons/io";
import { useShallow } from "zustand/react/shallow";
import { useSearchStore, useSurvivorStore } from "../stores";

export function DistanceFilter() {
  const myId = useSurvivorStore((state) => state.id);
  const { maxDistance, setMaxDistance } = useSearchStore(
    useShallow((state) => ({
      maxDistance: state.maxDistance,
      setMaxDistance: state.actions.setMaxDistance,
    })),
  );

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
        onClick={() => setMaxDistance(null)}
      >
        <IoMdInfinite />
      </IconButton>
    </div>
  );
}

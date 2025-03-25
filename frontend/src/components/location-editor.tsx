// libs
import { Button, TextField } from "@radix-ui/themes";
import { useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import { FaMap } from "react-icons/fa";
import { useShallow } from "zustand/react/shallow";

// internals
import { QueryKeys } from "../constants";
import { useUpdateSurvivor } from "../hooks";
import { useSearchStore, useSurvivorStore, useToastsStore } from "../stores";

interface LocationEditorProps {
  latitude?: number;
  longitude?: number;
  setLatitude?: (latitude: number) => void;
  setLongitude?: (longitude: number) => void;
}
export function LocationEditor({
  latitude: extLatitude,
  longitude: extLongitude,
  setLatitude: extSetLatitude,
  setLongitude: extSetLongitude,
}: LocationEditorProps) {
  const { myId, myName, myLatitude, myLongitude, identify } = useSurvivorStore(
    useShallow((state) => ({
      myId: state.id,
      myName: state.name,
      myLatitude: state.latitude,
      myLongitude: state.longitude,
      identify: state.actions.identify,
    })),
  );
  const maxDistance = useSearchStore((state) => state.maxDistance);
  const openToast = useToastsStore((state) => state.actions.openToast);

  const [tempLatitude, setTempLatitude] = useState<number>(myLatitude ?? 0);
  const [tempLongitude, setTempLongitude] = useState<number>(myLongitude ?? 0);

  const queryClient = useQueryClient();

  const { mutate } = useUpdateSurvivor({
    identifier: myId,
    onSuccess: () => {
      identify(myId, myName, tempLatitude, tempLongitude);
      openToast({
        id: "location-update-success",
        title: "Location updated",
        description: "Your location has been updated successfully",
        type: "success",
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.GetSurvivors, myId, maxDistance],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.GetSurvivor, myId],
      });
    },
  });

  return (
    <fieldset>
      <p className="text-lime-500">Location</p>
      <label>
        <span className="text-sm">Latitude</span>
        <TextField.Root
          type="number"
          value={extLatitude ?? tempLatitude}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            (extSetLatitude ?? setTempLatitude)(parseFloat(e.target.value))
          }
        />
      </label>

      <label>
        <span className="text-sm">Longitude</span>
        <TextField.Root
          type="number"
          value={extLongitude ?? tempLongitude}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            (extSetLongitude ?? setTempLongitude)(parseFloat(e.target.value))
          }
        />
      </label>

      {!extSetLatitude && !extLongitude && (
        <div className="flex justify-end pt-2">
          <Button
            disabled={
              tempLatitude === myLatitude && tempLongitude === myLongitude
            }
            onClick={() =>
              mutate({
                latitude: tempLatitude,
                longitude: tempLongitude,
              })
            }
          >
            <FaMap />
            Update location
          </Button>
        </div>
      )}
    </fieldset>
  );
}

// libs
import { Button, TextField } from "@radix-ui/themes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useCallback, useState } from "react";
import { FaMap } from "react-icons/fa";
import { useShallow } from "zustand/react/shallow";

// internals
import {
  Toast,
  useSearchStore,
  useSurvivorStore,
  useToastsStore,
} from "../stores";
import { LatLon } from "../types";

const TOASTS: Record<string, Toast> = {
  "location-update-success": {
    title: "Location updated",
    description: "Your location has been updated successfully",
    type: "success",
    open: false,
  },
  "location-update-error": {
    title: "Location update failed",
    description: "An error occurred while updating your location",
    type: "error",
    open: false,
  },
  "location-update-unauthorized": {
    title: "Location update failed",
    description: "You are not authorized to update another survivor's location",
    type: "error",
    open: false,
  },
};
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

  const { openToast, bulkRegisterToasts } = useToastsStore(
    useShallow((state) => ({
      openToast: state.actions.openToast,
      bulkRegisterToasts: state.actions.bulkRegisterToasts,
    })),
  );
  // Avoid updating ToastsEngine while this renders
  setTimeout(() => bulkRegisterToasts({ ...TOASTS }));

  const [tempLatitude, setTempLatitude] = useState<number>(myLatitude ?? 0);
  const [tempLongitude, setTempLongitude] = useState<number>(myLongitude ?? 0);

  const queryClient = useQueryClient();

  const mutationFn = useCallback(
    async (data: LatLon) => {
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("X-User-Id", myId!);

      const response = await fetch(`/api/survivors/${myId}/location/`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData?.status === 401) {
          openToast("location-update-unauthorized");
          throw new Error("Unauthorized");
        }
        openToast("location-update-error");
        throw new Error(errorData?.detail ?? "An error occurred");
      }
    },
    [myId, openToast],
  );

  const mutation = useMutation({
    mutationFn,
    onSuccess: async () => {
      identify(myId, myName, tempLatitude, tempLongitude);
      openToast("location-update-success");
      queryClient.invalidateQueries({
        queryKey: ["get-survivors", myId, maxDistance],
      });
      queryClient.invalidateQueries({
        queryKey: ["get-survivor", myId],
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
            onClick={async () => {
              await mutation.mutate({
                latitude: tempLatitude,
                longitude: tempLongitude,
              });
            }}
          >
            <FaMap />
            Update location
          </Button>
        </div>
      )}
    </fieldset>
  );
}

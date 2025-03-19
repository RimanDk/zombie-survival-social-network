// libs
import { Button, Popover, Separator, TextField } from "@radix-ui/themes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { FaMap, FaRegUser } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { useShallow } from "zustand/react/shallow";

// internals
import { useSurvivorStore } from "../stores";
import { ToastEngine, ToastsConfig } from "./toast-engine";
import { LatLon } from "../types";

export function UserPanel() {
  const { myId, myName, myLatitude, myLongitude, identify } = useSurvivorStore(
    useShallow((state) => ({
      myId: state.id,
      myName: state.name,
      myLatitude: state.latitude,
      myLongitude: state.longitude,
      identify: state.actions.identify,
    })),
  );

  const [tempLatitude, setTempLatitude] = useState<number>(myLatitude ?? 0);
  const [tempLongitude, setTempLongitude] = useState<number>(myLongitude ?? 0);

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
          throw new Error("Unauthorized");
        }
        throw new Error(errorData?.detail ?? "An error occurred");
      }
      return response.json();
    },
    [myId],
  );

  const mutation = useMutation({
    mutationFn,
    onError: (err) => {
      if (err.message === "Unauthorized") {
        setOpenToasts(["location-update-unauthorized"]);
        return;
      }
      setOpenToasts(["location-update-error"]);
    },
    onSuccess: async () => {
      identify(myId, myName, tempLatitude, tempLongitude);
      await queryClient.invalidateQueries({
        queryKey: ["get-survivors", myId],
      });
      setOpenToasts(["location-update-success"]);
    },
  });

  const queryClient = useQueryClient();

  const toasts = useMemo(
    () => ({
      "location-update-success": {
        title: "Location updated",
        description: "Your location has been updated successfully",
        type: "success",
      },
      "location-update-error": {
        title: "Location update failed",
        description: "An error occurred while updating your location",
        type: "error",
      },
      "location-update-unauthorized": {
        title: "Location update failed",
        description:
          "You are not authorized to update another survivor's location",
        type: "error",
      },
    }),
    [],
  );
  const [openToasts, setOpenToasts] = useState<(keyof typeof toasts)[]>([]);

  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button variant="soft">
          <FaRegUser />
          <span>{myName}</span>
        </Button>
      </Popover.Trigger>

      <Popover.Content width="20rem">
        <div className="flex flex-col gap-2">
          <fieldset>
            <p className="text-lime">Location</p>
            <label>
              <span className="text-sm">Latitude</span>
              <TextField.Root
                value={tempLatitude}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setTempLatitude(parseFloat(e.target.value))
                }
              />
            </label>

            <label>
              <span className="text-sm">Longitude</span>
              <TextField.Root
                value={tempLongitude}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setTempLongitude(parseFloat(e.target.value))
                }
              />
            </label>

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
          </fieldset>

          <Separator size="4" />

          <footer className="flex justify-end">
            <Popover.Close>
              <Button
                variant="soft"
                color="gray"
                onClick={() => identify(null, null, null, null)}
              >
                <MdLogout />
                Sign out
              </Button>
            </Popover.Close>
          </footer>
        </div>
      </Popover.Content>

      <ToastEngine toasts={toasts as ToastsConfig} openToasts={openToasts} />
    </Popover.Root>
  );
}

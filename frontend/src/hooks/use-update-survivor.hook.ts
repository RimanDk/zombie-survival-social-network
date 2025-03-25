// libs
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
// internals
import { useToastsStore } from "../stores";
import { LatLonBase, Survivor } from "../types";

interface UseUpdateSurvivorProps {
  identifier: string | null;
  onSuccess: (data: Survivor) => void;
}
export const useUpdateSurvivor = ({
  identifier,
  onSuccess,
}: UseUpdateSurvivorProps) => {
  const openToast = useToastsStore((state) => state.actions.openToast);

  const mutationFn = useCallback(
    async (data: LatLonBase) => {
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("X-User-Id", identifier!);

      const response = await fetch(`/api/survivors/${identifier}/location/`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData?.status === 401) {
          openToast({
            id: "location-update-unauthorized",
            title: "Location update failed",
            description:
              "You are not authorized to update another survivor's location",
            type: "error",
          });
          throw new Error("Unauthorized");
        }
        openToast({
          id: "location-update-error",
          title: "Location update failed",
          description: "An error occurred while updating your location",
          type: "error",
        });
        throw new Error(errorData?.detail ?? "An error occurred");
      }

      try {
        return await response.json();
      } catch (err) {
        openToast({
          id: "location-update-error",
          title: "Location update failed",
          description: "An error occurred while updating your location",
          type: "error",
        });
        throw err;
      }
    },
    [identifier, openToast],
  );

  return useMutation({
    mutationFn,
    onSuccess,
  });
};

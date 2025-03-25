// libs
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

// internals
import { Toast, useToastsStore } from "../stores";
import { LatLon, Survivor } from "../types";

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

interface UseUpdateSurvivorProps {
  identifier: string | null;
  onSuccess: (data: Survivor) => void;
}
export const useUpdateSurvivor = ({
  identifier,
  onSuccess,
}: UseUpdateSurvivorProps) => {
  const { openToast, bulkRegisterToasts } = useToastsStore(
    useShallow((state) => ({
      openToast: state.actions.openToast,
      bulkRegisterToasts: state.actions.bulkRegisterToasts,
    })),
  );
  // Avoid updating ToastsEngine while this renders
  setTimeout(() => bulkRegisterToasts({ ...TOASTS }));

  const mutationFn = useCallback(
    async (data: LatLon) => {
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
          openToast("location-update-unauthorized");
          throw new Error("Unauthorized");
        }
        openToast("location-update-error");
        throw new Error(errorData?.detail ?? "An error occurred");
      }

      try {
        return await response.json();
      } catch (err) {
        openToast("location-update-error");
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

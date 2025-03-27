// libs
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
// internals
import { LatLonBase, Survivor } from "../types";

interface UseUpdateSurvivorProps {
  identifier: string | null;
  onSuccess: (data: Survivor) => void;
  onError: (err: Error) => void;
}
export const useUpdateSurvivorLocation = ({
  identifier,
  onSuccess,
  onError,
}: UseUpdateSurvivorProps) => {
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
          throw new Error("Unauthorized");
        }
        throw new Error(errorData?.detail ?? "An error occurred");
      }
      return await response.json();
    },
    [identifier],
  );

  return useMutation({
    mutationFn,
    onSuccess,
    onError,
  });
};

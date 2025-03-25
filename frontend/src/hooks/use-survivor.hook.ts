// libs
import { useQuery } from "@tanstack/react-query";

// internals
import { QueryKeys } from "../constants";
import { useToastsStore } from "../stores";
import { ErrorState, Survivor } from "../types";

interface UseSurvivorProps {
  enabled?: boolean;
  identifier: string | null;
  onSuccess?: (data: Survivor | ErrorState) => void;
}
export const useSurvivor = ({
  enabled,
  identifier,
  onSuccess,
}: UseSurvivorProps) => {
  const openToast = useToastsStore((state) => state.actions.openToast);

  const { data, isFetching, refetch } = useQuery<Survivor | ErrorState>({
    queryKey: [QueryKeys.GetSurvivor, identifier],
    queryFn: async () => {
      const response = await fetch(`/api/survivors/${identifier}`);

      if (!response.ok) {
        if (response.status === 404) {
          openToast({
            id: "loadprofile-not-fount",
            title: "Error",
            description: "Could not find survivor in the system",
            type: "error",
          });
          throw new Error("Not found");
        }
        openToast({
          id: "loadprofile-error",
          title: "Error",
          description: "An error occurred while loading survivor",
          type: "error",
        });
        throw new Error("An error occurred");
      }

      try {
        const data = await response.json();
        onSuccess?.(data);
        return data;
      } catch (err) {
        openToast({
          id: "loadprofile-data-corrupted",
          title: "Error",
          description: "Survivor data is corrupted",
          type: "error",
        });
        throw err;
      }
    },
    enabled,
  });

  return { data, isFetching, refetch };
};

// libs
import { useQuery } from "@tanstack/react-query";

// internals
import { QueryKeys } from "../constants";
import { useToastsStore } from "../stores";
import { Survivor } from "../types";

interface UseSurvivorsProps {
  identifier: string | null;
  maxDistance: number | null;
}
export const useSurvivors = ({
  identifier,
  maxDistance,
}: UseSurvivorsProps) => {
  const openToast = useToastsStore((state) => state.actions.openToast);

  const { data, isFetching } = useQuery<Survivor[]>({
    queryKey: [QueryKeys.GetSurvivors, identifier, maxDistance],
    queryFn: async () => {
      const headers = new Headers();
      if (identifier) {
        headers.append("X-User-Id", identifier);
      }

      const search = new URLSearchParams();
      if (maxDistance) {
        search.append("max_distance", `${maxDistance}`);
      }

      const response = await fetch(`/api/survivors/?${search.toString()}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        openToast({
          id: "load-survivors-error",
          title: "Error",
          description: "An error occurred while loading survivors",
          type: "error",
        });
        throw new Error("An error occurred");
      }
      try {
        return response.json();
      } catch (err) {
        openToast({
          id: "load-survivors-data-corrupted",
          title: "Error",
          description: "Survivors data is corrupted",
          type: "error",
        });
        throw err;
      }
    },
  });

  return { data, isFetching };
};

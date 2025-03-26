// libs
import { useQuery } from "@tanstack/react-query";

// internals
import { QueryKeys } from "../constants";
import { Survivor } from "../types";

interface UseSurvivorsProps {
  identifier: string | null;
  maxDistance: number | null;
  onError: (err: Error) => void;
}
export const useSurvivors = ({
  identifier,
  maxDistance,
  onError,
}: UseSurvivorsProps) =>
  useQuery<Survivor[]>({
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
        onError(new Error("An error occurred"));
      }
      try {
        return response.json();
      } catch (err) {
        onError(err as Error);
      }
    },
  });

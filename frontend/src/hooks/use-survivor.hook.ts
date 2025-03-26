// libs
import { useQuery } from "@tanstack/react-query";

// internals
import { QueryKeys } from "../constants";
import { ErrorState, Survivor } from "../types";

interface UseSurvivorProps {
  enabled?: boolean;
  identifier: string | null;
  onSuccess?: (data: Survivor | ErrorState) => void;
  onError: (err: Error) => void;
}
export const useSurvivor = ({
  enabled,
  identifier,
  onSuccess,
  onError,
}: UseSurvivorProps) =>
  useQuery<Survivor | ErrorState>({
    queryKey: [QueryKeys.GetSurvivor, identifier],
    queryFn: async () => {
      const response = await fetch(`/api/survivors/${identifier}`);

      if (!response.ok) {
        if (response.status === 404) {
          onError(new Error("Not found"));
          return;
        }
        onError(new Error("An error occurred"));
      }

      try {
        const data = await response.json();
        onSuccess?.(data);
        return data;
      } catch (err) {
        onError(err as Error);
      }
    },
    enabled,
  });

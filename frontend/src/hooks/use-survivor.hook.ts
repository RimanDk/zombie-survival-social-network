// libs
import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

// internals
import { ErrorState, Survivor } from "../types";
import { QueryKeys } from "../constants";
import { Toast, useToastsStore } from "../stores";

const TOASTS: Record<string, Toast> = {
  "load-survivor-not-fount": {
    title: "Error",
    description: "Could not find survivor in the system",
    type: "error",
    open: false,
  },
  "load-survivor-error": {
    title: "Error",
    description: "An error occurred while loading survivor",
    type: "error",
    open: false,
  },
  "load-survivor-data-corrupted": {
    title: "Error",
    description: "Survivor data is corrupted",
    type: "error",
    open: false,
  },
};

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
  const { openToast, bulkRegisterToasts } = useToastsStore(
    useShallow((state) => ({
      openToast: state.actions.openToast,
      bulkRegisterToasts: state.actions.bulkRegisterToasts,
    })),
  );
  // Avoid updating ToastsEngine while this renders
  setTimeout(() => bulkRegisterToasts({ ...TOASTS }), 0);

  const { data, isFetching, refetch } = useQuery<Survivor | ErrorState>({
    queryKey: [QueryKeys.GetSurvivor, identifier],
    queryFn: async () => {
      const response = await fetch(`/api/survivors/${identifier}`);

      if (!response.ok) {
        if (response.status === 404) {
          openToast("loadprofile-not-fount");
          throw new Error("Not found");
        }
        openToast("loadprofile-error");
        throw new Error("An error occurred");
      }

      try {
        const data = await response.json();
        onSuccess?.(data);
        return data;
      } catch (err) {
        openToast("loadprofile-data-corrupted");
        throw err;
      }
    },
    enabled,
  });

  return { data, isFetching, refetch };
};

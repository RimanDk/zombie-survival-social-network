// libs
import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

// internals
import { QueryKeys } from "../constants";
import { Toast, useToastsStore } from "../stores";
import { Survivor } from "../types";

const TOASTS: Record<string, Toast> = {
  "load-survivors-error": {
    title: "Error",
    description: "An error occurred while loading survivors",
    type: "error",
    open: false,
  },
  "load-survivors-data-corrupted": {
    title: "Error",
    description: "Survivors data is corrupted",
    type: "error",
    open: false,
  },
};

interface UseSurvivorsProps {
  identifier: string | null;
  maxDistance: number | null;
}
export const useSurvivors = ({
  identifier,
  maxDistance,
}: UseSurvivorsProps) => {
  const { openToast, bulkRegisterToasts } = useToastsStore(
    useShallow((state) => ({
      openToast: state.actions.openToast,
      bulkRegisterToasts: state.actions.bulkRegisterToasts,
    })),
  );

  // Avoid updating ToastsEngine while this renders
  setTimeout(() => bulkRegisterToasts({ ...TOASTS }), 0);

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
        openToast("load-survivors-error");
        throw new Error("An error occurred");
      }
      try {
        return response.json();
      } catch (err) {
        openToast("load-survivors-data-corrupted");
        throw err;
      }
    },
  });

  return { data, isFetching };
};

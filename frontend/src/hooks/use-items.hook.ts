// libs
import { useShallow } from "zustand/react/shallow";
import { useQuery } from "@tanstack/react-query";

// internals
import { Toast, useToastsStore } from "../stores";
import { Item } from "../types";

const TOASTS: Record<string, Toast> = {
  "load-items-error": {
    title: "Error",
    description: "An error occurred while loading items",
    type: "error",
    open: false,
  },
  "load-items-data-corrupted": {
    title: "Error",
    description: "Items data is corrupted",
    type: "error",
    open: false,
  },
};

export const useItems = () => {
  const { openToast, bulkRegisterToasts } = useToastsStore(
    useShallow((state) => ({
      openToast: state.actions.openToast,
      bulkRegisterToasts: state.actions.bulkRegisterToasts,
    })),
  );
  // Avoid updating ToastsEngine while this renders
  setTimeout(() => bulkRegisterToasts({ ...TOASTS }), 0);

  const { data: possibleItems } = useQuery<Item[]>({
    queryKey: ["get-items"],
    queryFn: async () => {
      const response = await fetch("/api/items/");

      if (!response.ok) {
        openToast("load-items-error");
        throw new Error("An error occurred");
      }
      try {
        return await response.json();
      } catch (err) {
        openToast("load-items-data-corrupted");
        throw err;
      }
    },
  });

  return possibleItems;
};

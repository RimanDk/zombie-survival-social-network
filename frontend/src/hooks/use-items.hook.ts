// libs
import { useQuery } from "@tanstack/react-query";

// internals
import { QueryKeys } from "../constants";
import { useToastsStore } from "../stores";
import { Item } from "../types";

export const useItems = () => {
  const openToast = useToastsStore((state) => state.actions.openToast);

  const { data: possibleItems } = useQuery<Item[]>({
    queryKey: [QueryKeys.GetItems],
    queryFn: async () => {
      const response = await fetch("/api/items/");

      if (!response.ok) {
        openToast({
          id: "load-items-error",
          title: "Error",
          description: "An error occurred while loading items",
          type: "error",
        });
        throw new Error("An error occurred");
      }
      try {
        return await response.json();
      } catch (err) {
        openToast({
          id: "load-items-data-corrupted",
          title: "Error",
          description: "Items data is corrupted",
          type: "error",
        });
        throw err;
      }
    },
  });

  return possibleItems;
};

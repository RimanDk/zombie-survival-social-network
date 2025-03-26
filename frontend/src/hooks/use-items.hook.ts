// libs
import { useQuery } from "@tanstack/react-query";

// internals
import { QueryKeys } from "../constants";
import { Item } from "../types";

interface UseItemsProps {
  onError: (err: Error) => void;
}
export const useItems = ({ onError }: UseItemsProps) =>
  useQuery<Item[]>({
    queryKey: [QueryKeys.GetItems],
    queryFn: async () => {
      const response = await fetch("/api/items/");

      if (!response.ok) {
        onError(new Error("An error occurred"));
      }
      try {
        return await response.json();
      } catch (err) {
        onError(err as Error);
      }
    },
  });

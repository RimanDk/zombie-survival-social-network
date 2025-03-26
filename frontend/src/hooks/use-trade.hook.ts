// libs
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

// internals
import { Survivor, Inventory as TInventory } from "../types";

interface UseTradeProps {
  identifier: string | null;
  onSuccess: (data: Survivor) => void;
  onError: (err: Error) => void;
}
export const useTrade = ({ identifier, onSuccess, onError }: UseTradeProps) => {
  const mutationFn = useCallback(
    async (data: {
      survivor_a_items: { survivor_id: string; items: TInventory };
      survivor_b_items: { survivor_id: string; items: TInventory };
    }) => {
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("X-User-Id", identifier!);

      const response = await fetch("/api/survivors/trade/", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to trade");
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

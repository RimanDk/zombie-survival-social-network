// libs
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

// internals
import { useToastsStore } from "../stores";
import { Survivor, Inventory as TInventory } from "../types";

interface UseTradeProps {
  identifier: string | null;
  onSuccess: (data: Survivor) => void;
}
export const useTrade = ({ identifier, onSuccess }: UseTradeProps) => {
  const openToast = useToastsStore((state) => state.actions.openToast);

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
        openToast({
          id: "trade-error",
          title: "Trade failed",
          description: "An error occurred while trading items",
          type: "error",
        });
        throw new Error("Failed to trade");
      }
      try {
        return await response.json();
      } catch (err) {
        openToast({
          id: "trade-error",
          title: "Trade failed",
          description: "An error occurred while trading items",
          type: "error",
        });
        throw err;
      }
    },
    [identifier, openToast],
  );

  return useMutation({
    mutationFn,
    onSuccess,
  });
};

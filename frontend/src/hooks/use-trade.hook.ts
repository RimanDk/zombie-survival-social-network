// libs
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { useCallback } from "react";

// internals
import { Toast, useToastsStore } from "../stores";
import { Survivor, Inventory as TInventory } from "../types";

const TOASTS: Record<string, Toast> = {
  "trade-error": {
    title: "Trade failed",
    description: "An error occurred while trading items",
    type: "error",
    open: false,
  },
  "trade-success": {
    title: "Trade successful",
    description: "Items have been traded successfully",
    type: "success",
    open: false,
  },
};

interface UseTradeProps {
  identifier: string | null;
  onSuccess: (data: Survivor) => void;
}
export const useTrade = ({ identifier, onSuccess }: UseTradeProps) => {
  const { openToast, bulkRegisterToasts } = useToastsStore(
    useShallow((state) => ({
      openToast: state.actions.openToast,
      bulkRegisterToasts: state.actions.bulkRegisterToasts,
    })),
  );
  // Avoid updating ToastsEngine while this renders
  setTimeout(() => bulkRegisterToasts({ ...TOASTS }), 0);

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
        openToast("trade-error");
        throw new Error("Failed to trade");
      }
      try {
        return await response.json();
      } catch (err) {
        openToast("trade-error");
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

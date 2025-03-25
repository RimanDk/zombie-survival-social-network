import { useShallow } from "zustand/react/shallow";
import { Toast, useToastsStore } from "../stores";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { Survivor, SurvivorBase } from "../types";

const TOASTS: Record<string, Toast> = {
  "create-survivor-success": {
    title: "Welcome!",
    description: "You have been added to the system!",
    type: "success",
    open: false,
  },
  "create-survivor-error": {
    title: "Failed to create",
    description: "An error occurred while adding you to the system",
    type: "error",
    open: false,
  },
};

interface UseCreateSurvivorProps {
  onSuccess: (data: Survivor) => void;
  onSettled: () => void;
}
export const useCreateSurvivor = ({
  onSuccess,
  onSettled,
}: UseCreateSurvivorProps) => {
  const { openToast, bulkRegisterToasts } = useToastsStore(
    useShallow((state) => ({
      openToast: state.actions.openToast,
      bulkRegisterToasts: state.actions.bulkRegisterToasts,
    })),
  );
  // Avoid updating ToastsEngine while this renders
  setTimeout(() => bulkRegisterToasts({ ...TOASTS }), 0);

  const mutationFn = useCallback(
    async (data: SurvivorBase) => {
      const headers = new Headers();
      headers.append("Content-Type", "application/json");

      const response = await fetch("/api/survivors/", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        openToast("registration-error");
        throw new Error("An error occurred");
      }
      try {
        return await response.json();
      } catch (err) {
        openToast("registration-error");
        throw err;
      }
    },
    [openToast],
  );

  return useMutation({
    mutationFn,
    onSuccess,
    onSettled,
  });
};

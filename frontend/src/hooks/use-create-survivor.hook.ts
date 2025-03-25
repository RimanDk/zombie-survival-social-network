import { useToastsStore } from "../stores";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { Survivor, SurvivorBase } from "../types";

interface UseCreateSurvivorProps {
  onSuccess: (data: Survivor) => void;
  onSettled: () => void;
}
export const useCreateSurvivor = ({
  onSuccess,
  onSettled,
}: UseCreateSurvivorProps) => {
  const openToast = useToastsStore((state) => state.actions.openToast);

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
        openToast({
          id: "create-survivor-error",
          title: "Failed to create",
          description: "An error occurred while adding you to the system",
          type: "error",
        });
        throw new Error("An error occurred");
      }
      try {
        return await response.json();
      } catch (err) {
        openToast({
          id: "create-survivor-error",
          title: "Failed to create",
          description: "An error occurred while adding you to the system",
          type: "error",
        });
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

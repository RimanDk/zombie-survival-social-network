// libs
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

// internals
import { Survivor, SurvivorBase } from "../types";

interface UseCreateSurvivorProps {
  onSuccess: (data: Survivor) => void;
  onError: (err: Error) => void;
  onSettled: () => void;
}
export const useCreateSurvivor = ({
  onSuccess,
  onError,
  onSettled,
}: UseCreateSurvivorProps) => {
  const mutationFn = useCallback(async (data: SurvivorBase) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const response = await fetch("/api/survivors/", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("An error occurred");
    }
    return await response.json();
  }, []);

  return useMutation({
    mutationFn,
    onSuccess,
    onError,
    onSettled,
  });
};

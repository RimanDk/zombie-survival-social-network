// libs
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

// internals
import { useToastsStore } from "../stores";

interface UseReportInfectionProps {
  identifier: string | null;
  survivor: string;
  onSuccess: () => void;
}
export const useReportInfection = ({
  identifier,
  survivor,
  onSuccess,
}: UseReportInfectionProps) => {
  const openToast = useToastsStore((state) => state.actions.openToast);

  const mutationFn = useCallback(async () => {
    const headers = new Headers();
    headers.append("X-User-Id", identifier!);

    const response = await fetch(`/api/survivors/${survivor}/report/`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        openToast({
          id: "report-unauthorized",
          title: "Unauthorized",
          description: "Your id doesn't match any we have in the system",
          type: "error",
        });
        throw new Error("Unauthorized");
      }
      openToast({
        id: "report-error",
        title: "Failed to report",
        description: "An error occurred while adding your report to the system",
        type: "error",
      });
      throw new Error("An error occurred");
    }
    return await response.json();
  }, [identifier, survivor, openToast]);

  return useMutation({
    mutationFn,
    onSuccess,
  });
};

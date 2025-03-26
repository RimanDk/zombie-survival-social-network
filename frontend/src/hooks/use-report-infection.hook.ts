// libs
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

interface UseReportInfectionProps {
  identifier: string | null;
  survivor: string;
  onSuccess: () => void;
  onError: (err: Error) => void;
}
export const useReportInfection = ({
  identifier,
  survivor,
  onSuccess,
  onError,
}: UseReportInfectionProps) => {
  const mutationFn = useCallback(async () => {
    const headers = new Headers();
    headers.append("X-User-Id", identifier!);

    const response = await fetch(`/api/survivors/${survivor}/report/`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error("An error occurred");
    }
    return await response.json();
  }, [identifier, survivor]);

  return useMutation({
    mutationFn,
    onSuccess,
    onError,
  });
};

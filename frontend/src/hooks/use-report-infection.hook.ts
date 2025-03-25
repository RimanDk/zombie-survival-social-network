// libs
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

// internals
import { Toast, useToastsStore } from "../stores";

const TOASTS: Record<string, Toast> = {
  "report-success": {
    title: "Infection reported!",
    description: "Thank you! Stay safe out there!",
    type: "success",
    open: false,
  },
  "report-unauthorized": {
    title: "Unauthorized",
    description: "Your id doesn't match any we have in the system",
    type: "error",
    open: false,
  },
  "report-error": {
    title: "Failed to report",
    description: "An error occurred while adding your report to the system",
    type: "error",
    open: false,
  },
};

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
  const { openToast, bulkRegisterToasts } = useToastsStore(
    useShallow((state) => ({
      openToast: state.actions.openToast,
      bulkRegisterToasts: state.actions.bulkRegisterToasts,
    })),
  );
  // Avoid updating ToastsEngine while this renders
  setTimeout(() => bulkRegisterToasts({ ...TOASTS }), 0);

  const mutationFn = useCallback(async () => {
    const headers = new Headers();
    headers.append("X-User-Id", identifier!);

    const response = await fetch(`/api/survivors/${survivor}/report/`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        openToast("report-unauthorized");
        throw new Error("Unauthorized");
      }
      openToast("report-error");
      throw new Error("An error occurred");
    }
    return await response.json();
  }, [identifier, survivor, openToast]);

  return useMutation({
    mutationFn,
    onSuccess,
  });
};

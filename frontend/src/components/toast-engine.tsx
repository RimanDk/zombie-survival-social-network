// libs
import { useEffect, useState } from "react";

// internals
import { Toast, ToastType } from ".";

interface ToastConfig {
  title?: string;
  description?: string;
  type: ToastType;
}
export type ToastsConfig = Record<string, ToastConfig>;
interface ToastEngineProps {
  toasts: ToastsConfig;
  openToasts: string[];
}
export function ToastEngine({ toasts, openToasts }: ToastEngineProps) {
  const [toastStates, setToastStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    console.info("Open toasts changed", openToasts);
    const newToastStates: Record<string, boolean> = {};
    for (const key in toasts) {
      newToastStates[key] = openToasts.includes(key);
    }
    console.info("updated toast states", newToastStates);
    setToastStates(newToastStates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(openToasts), JSON.stringify(toasts)]);

  const onOpenChange = (key: string) => (open: boolean) => {
    setToastStates((prev) => ({ ...prev, [key]: open }));
  };

  return (
    <>
      {Object.entries(toasts).map(([key, toast]) => (
        <Toast
          key={key}
          title={toast.title}
          description={toast.description}
          type={toast.type}
          open={toastStates[key]}
          onOpenChange={onOpenChange(key)}
        />
      ))}
    </>
  );
}

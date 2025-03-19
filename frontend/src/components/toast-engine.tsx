// libs
import { useShallow } from "zustand/react/shallow";

// internals
import { useToastsStore } from "../stores";
import { Toast } from ".";

export function ToastEngine() {
  const { toasts, toggleToast } = useToastsStore(
    useShallow((state) => ({
      toasts: state.toasts,
      toggleToast: state.actions.toggleToast,
    })),
  );

  return (
    <>
      {Object.entries(toasts).map(([key, toast]) => {
        return (
          <Toast
            key={key}
            title={toast.title}
            description={toast.description}
            type={toast.type}
            open={toast.open}
            onOpenChange={toggleToast(key)}
          />
        );
      })}
    </>
  );
}

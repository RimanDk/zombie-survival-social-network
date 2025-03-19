// libs
import { create } from "zustand";

// internals
import { ToastType } from "../components";

export type Toast = {
  title?: string;
  description?: string;
  type: ToastType;
  open: boolean;
};
interface ToastStoreState {
  toasts: Record<string, Toast>;
  actions: {
    registerToast: (id: string, toast: Toast) => void;
    bulkRegisterToasts: (toasts: Record<string, Toast>) => void;
    openToast: (id: string) => void;
    toggleToast: (id: string) => (open: boolean) => void;
  };
}
export const useToastsStore = create<ToastStoreState>((set) => ({
  toasts: {},
  actions: {
    registerToast: (id, toast) => {
      set((state) =>
        id in state.toasts ?
          state
        : { ...state, toasts: { ...state.toasts, [id]: toast } },
      );
    },
    bulkRegisterToasts: (toasts) => {
      set((state) => {
        const toastsToAdd: Record<string, Toast> = {};
        for (const key in toasts) {
          if (!(key in state.toasts)) {
            toastsToAdd[key] = toasts[key];
          }
        }
        if (Object.keys(toastsToAdd).length === 0) {
          return state;
        }
        return { ...state, toasts: { ...state.toasts, ...toastsToAdd } };
      });
    },
    openToast: (id) => {
      set((state) => {
        return {
          ...state,
          toasts: {
            ...state.toasts,
            [id]: { ...state.toasts[id], open: true },
          },
        };
      });
    },
    toggleToast: (id) => (open) => {
      set((state) => ({
        ...state,
        toasts: {
          ...state.toasts,
          [id]: { ...state.toasts[id], open },
        },
      }));
    },
  },
}));

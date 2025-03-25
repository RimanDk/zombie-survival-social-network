// libs
import { create } from "zustand";

// internals
import { ToastType } from "../components";

export type ToastBase = {
  id: string;
  title?: string;
  description?: string;
  type: ToastType;
};
export type Toast = ToastBase & {
  open: boolean;
};
interface ToastStoreState {
  toasts: Record<string, Toast>;
  actions: {
    toggleToast: (id: string) => (open: boolean) => void;
    openToast: (toast: ToastBase) => void;
  };
}
export const useToastsStore = create<ToastStoreState>((set) => ({
  toasts: {},
  actions: {
    toggleToast: (id) => (open) => {
      set((state) => ({
        ...state,
        toasts: {
          ...state.toasts,
          [id]: { ...state.toasts[id], open },
        },
      }));
    },
    openToast: (toast) => {
      set((state) => {
        return {
          ...state,
          toasts: {
            ...state.toasts,
            [toast.id]: { ...(state.toasts[toast.id] ?? toast), open: true },
          },
        };
      });
    },
  },
}));

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SurvivorStoreState {
  id: string | null;
  name: string | null;
  actions: {
    identify: (id: string | null, name: string | null) => void;
  };
}
export const useSurvivorStore = create<SurvivorStoreState>()(
  persist(
    (set) => ({
      id: null,
      name: null,
      actions: {
        identify: (id, name) => set({ id, name }),
      },
    }),
    {
      name: "survivor-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ id: state.id }),
    },
  ),
);

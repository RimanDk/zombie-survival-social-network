import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Inventory } from "../types";

interface SurvivorStoreState {
  id: string | null;
  name: string | null;
  latitude: number | null;
  longitude: number | null;
  inventory: Inventory;
  actions: {
    identify: (
      id: string | null,
      name: string | null,
      latitude: number | null,
      longitude: number | null,
    ) => void;
    updateInventory: (inventory: Inventory) => void;
  };
}
export const useSurvivorStore = create<SurvivorStoreState>()(
  persist(
    (set) => ({
      id: null,
      name: null,
      latitude: null,
      longitude: null,
      inventory: {},
      actions: {
        identify: (id, name, latitude, longitude) => {
          set({ id, name, latitude, longitude });
        },
        updateInventory: (inventory) => {
          set({ inventory });
        },
      },
    }),
    {
      name: "survivor-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ id: state.id }),
    },
  ),
);

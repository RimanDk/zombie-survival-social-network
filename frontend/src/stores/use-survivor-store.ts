import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SurvivorStoreState {
  id: string | null;
  name: string | null;
  latitude: number | null;
  longitude: number | null;
  actions: {
    identify: (
      id: string | null,
      name: string | null,
      latitude: number | null,
      longitude: number | null,
    ) => void;
  };
}
export const useSurvivorStore = create<SurvivorStoreState>()(
  persist(
    (set) => ({
      id: null,
      name: null,
      latitude: null,
      longitude: null,
      actions: {
        identify: (id, name, latitude, longitude) =>
          set({ id, name, latitude, longitude }),
      },
    }),
    {
      name: "survivor-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ id: state.id }),
    },
  ),
);

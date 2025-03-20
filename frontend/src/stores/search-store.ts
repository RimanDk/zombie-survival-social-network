import { create } from "zustand";

interface SearchStore {
  maxDistance: number | null;
  actions: {
    setMaxDistance: (maxDistance: number | null) => void;
  };
}
export const useSearchStore = create<SearchStore>((set) => ({
  maxDistance: null,
  actions: {
    setMaxDistance: (maxDistance) => {
      set({ maxDistance });
    },
  },
}));

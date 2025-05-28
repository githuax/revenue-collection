import { create } from "zustand";

interface TempStoreState {
  data: any;
  setData: (data: any) => void;
  removeData: () => void;
}

export const useTempStore = create<TempStoreState>((set) => ({
  data: null,
  setData: (data) => set({ data }),
  removeData: () => set({ data: null })
}));

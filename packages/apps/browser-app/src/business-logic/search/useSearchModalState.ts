import { create } from "zustand";

interface SearchModalState {
  isOpen: boolean;
  open(): void;
  close(): void;
  toggle(): void;
}

const useSearchModalStateStore = create<SearchModalState>((set) => ({
  isOpen: false,
  open() {
    set({ isOpen: true });
  },
  close() {
    set({ isOpen: false });
  },
  toggle() {
    set((state) => ({ isOpen: !state.isOpen }));
  },
}));

export default function useSearchModalState(): SearchModalState {
  return useSearchModalStateStore();
}

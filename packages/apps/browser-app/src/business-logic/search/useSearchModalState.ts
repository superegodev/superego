import { create } from "zustand";

interface SearchModalState {
  isOpen: boolean;
  setIsOpen(isOpen: boolean): void;
}

const useSearchModalStateStore = create<SearchModalState>((set) => ({
  isOpen: false,
  setIsOpen(isOpen: boolean) {
    set({ isOpen });
  },
}));

export default function useSearchModalState(): SearchModalState {
  return useSearchModalStateStore();
}

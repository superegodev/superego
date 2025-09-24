import { create } from "zustand";

const useShellStore = create<UseShell>((set) => ({
  isPrimarySidebarOpen: false,
  openPrimarySidebar() {
    set({ isPrimarySidebarOpen: true });
  },
  closePrimarySidebar() {
    set({ isPrimarySidebarOpen: false });
  },
  togglePrimarySidebar() {
    set(({ isPrimarySidebarOpen }) => ({
      isPrimarySidebarOpen: !isPrimarySidebarOpen,
    }));
  },
}));

interface UseShell {
  isPrimarySidebarOpen: boolean;
  openPrimarySidebar: () => void;
  closePrimarySidebar: () => void;
  togglePrimarySidebar: () => void;
}
export default function useShell(): UseShell {
  return useShellStore();
}

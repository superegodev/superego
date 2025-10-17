import { create } from "zustand";

const useShellStore = create<UseShell>((set) => ({
  togglePrimarySidebarButtonId: "TogglePrimarySidebarButton",
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
  togglePrimarySidebarButtonId: "TogglePrimarySidebarButton";
  isPrimarySidebarOpen: boolean;
  openPrimarySidebar: () => void;
  closePrimarySidebar: () => void;
  togglePrimarySidebar: () => void;
}
export default function useShell(): UseShell {
  return useShellStore();
}

import { create } from "zustand";

const useShellStore = create<UseShell>((set) => ({
  togglePrimarySidebarButtonId: "TogglePrimarySidebarButton",
  isPrimarySidebarOpen: false,
  collapsePrimarySidebar: false,
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
  setCollapsePrimarySidebar(collapse: boolean) {
    set({ collapsePrimarySidebar: collapse });
  },
}));

interface UseShell {
  togglePrimarySidebarButtonId: "TogglePrimarySidebarButton";
  isPrimarySidebarOpen: boolean;
  collapsePrimarySidebar: boolean;
  openPrimarySidebar: () => void;
  closePrimarySidebar: () => void;
  togglePrimarySidebar: () => void;
  setCollapsePrimarySidebar: (collapse: boolean) => void;
}
export default function useShell(): UseShell {
  return useShellStore();
}

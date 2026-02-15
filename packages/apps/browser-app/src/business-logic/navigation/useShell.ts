import { create } from "zustand";

const useShellStore = create<UseShell>((set) => ({
  togglePrimarySidebarButtonId: "TogglePrimarySidebarButton",
  isPrimarySidebarOpen: false,
  primarySidebarCollapse: "SmallScreens",
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
  setPrimarySidebarCollapse(collapse: "Always" | "SmallScreens") {
    set({ primarySidebarCollapse: collapse });
  },
}));

interface UseShell {
  togglePrimarySidebarButtonId: "TogglePrimarySidebarButton";
  isPrimarySidebarOpen: boolean;
  primarySidebarCollapse: "Always" | "SmallScreens";
  openPrimarySidebar: () => void;
  closePrimarySidebar: () => void;
  togglePrimarySidebar: () => void;
  setPrimarySidebarCollapse: (collapse: "Always" | "SmallScreens") => void;
}
export default function useShell(): UseShell {
  return useShellStore();
}

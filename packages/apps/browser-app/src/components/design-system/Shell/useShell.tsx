import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

interface UseShell {
  isPrimarySidebarOpen: boolean;
  togglePrimarySidebar: () => void;
}

const ShellContext = createContext<UseShell | null>(null);

export function useShell(): UseShell {
  const shell = useContext(ShellContext);
  if (!shell) {
    throw new Error("You can only use this hook within a ShellProvider");
  }
  return shell;
}

interface Props {
  children: (shell: UseShell) => ReactNode;
}
export function ShellProvider({ children }: Props) {
  const [isPrimarySidebarOpen, setIsPrimarySidebarOpen] = useState(false);
  const togglePrimarySidebar = useCallback(() => {
    setIsPrimarySidebarOpen((value) => !value);
  }, []);
  const contextValue = { isPrimarySidebarOpen, togglePrimarySidebar };
  return (
    <ShellContext.Provider value={contextValue}>
      {children(contextValue)}
    </ShellContext.Provider>
  );
}

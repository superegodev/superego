import type { DocumentVersionId } from "@superego/backend";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface DocumentHistoryContextValue {
  /** Whether the history sidebar is open */
  isHistorySidebarOpen: boolean;
  /** Toggle the history sidebar open/closed */
  toggleHistorySidebar: () => void;
  /** The currently selected version ID, or null if viewing latest */
  selectedVersionId: DocumentVersionId | null;
  /** Select a version to view, or null to view latest */
  selectVersion: (id: DocumentVersionId | null) => void;
}

const DocumentHistoryContext =
  createContext<DocumentHistoryContextValue | null>(null);

interface DocumentHistoryProviderProps {
  children: ReactNode;
}

export function DocumentHistoryProvider({
  children,
}: DocumentHistoryProviderProps) {
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] =
    useState<DocumentVersionId | null>(null);

  const toggleHistorySidebar = useCallback(() => {
    setIsHistorySidebarOpen((prev) => !prev);
  }, []);

  const selectVersion = useCallback((id: DocumentVersionId | null) => {
    setSelectedVersionId(id);
  }, []);

  return (
    <DocumentHistoryContext.Provider
      value={{
        isHistorySidebarOpen,
        toggleHistorySidebar,
        selectedVersionId,
        selectVersion,
      }}
    >
      {children}
    </DocumentHistoryContext.Provider>
  );
}

export function useDocumentHistory(): DocumentHistoryContextValue {
  const context = useContext(DocumentHistoryContext);
  if (!context) {
    throw new Error(
      "useDocumentHistory must be used within a DocumentHistoryProvider",
    );
  }
  return context;
}

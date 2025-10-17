import type {
  Collection,
  CollectionCategory,
  Connector,
  DeveloperPrompts,
  GlobalSettings,
} from "@superego/backend";
import { createContext, useContext } from "react";

interface GlobalData {
  collectionCategories: CollectionCategory[];
  collections: Collection[];
  connectors: Connector[];
  globalSettings: GlobalSettings;
  developerPrompts: DeveloperPrompts;
}

const GlobalDataContext = createContext<GlobalData | null>(null);

export const GlobalDataProvider = GlobalDataContext.Provider;

export function useGlobalData(): GlobalData {
  const globalData = useContext(GlobalDataContext);
  if (!globalData) {
    throw new Error("You can only use this hook within the GlobalDataProvider");
  }
  return globalData;
}

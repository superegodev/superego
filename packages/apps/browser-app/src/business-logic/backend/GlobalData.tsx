import type {
  Collection,
  CollectionCategory,
  GlobalSettings,
} from "@superego/backend";
import { createContext, useContext } from "react";

interface GlobalData {
  collectionCategories: CollectionCategory[];
  collections: Collection[];
  globalSettings: GlobalSettings;
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

import { useContext } from "react";
import LoadDemoDataContext from "./LoadDemoDataContext.js";

export default function useLoadDemoData(): (() => Promise<void>) | undefined {
  return useContext(LoadDemoDataContext);
}

import { useContext } from "react";
import LoadDemoDataContext from "./LoadDemoDataContext.js";
import type LoadDemoDataFn from "./LoadDemoDataFn.js";

export default function useLoadDemoData(): LoadDemoDataFn | undefined {
  return useContext(LoadDemoDataContext);
}

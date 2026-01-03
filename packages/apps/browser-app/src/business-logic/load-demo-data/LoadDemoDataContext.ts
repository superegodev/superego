import { createContext } from "react";
import type LoadDemoDataFn from "./LoadDemoDataFn.js";

export default createContext<LoadDemoDataFn | undefined>(undefined);

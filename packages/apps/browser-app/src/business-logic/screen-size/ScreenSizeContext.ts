import { createContext } from "react";
import type ScreenSize from "./ScreenSize.js";

export default createContext<ScreenSize | null>(null);

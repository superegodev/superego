import { createContext } from "react";
import type Settings from "../../../types/Settings.js";

export default createContext<Settings | null>(null);

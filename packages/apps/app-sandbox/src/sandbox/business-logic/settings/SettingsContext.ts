import { createContext } from "react";
import type Settings from "../../../common-types/Settings.js";

export default createContext<Settings | null>(null);

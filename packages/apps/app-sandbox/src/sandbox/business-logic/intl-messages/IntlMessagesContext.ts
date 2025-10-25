import { createContext } from "react";
import type IntlMessages from "../../../types/IntlMessages.js";

export default createContext<IntlMessages | null>(null);

import { createContext } from "react";
import type IntlMessages from "../../../common-types/IntlMessages.js";

export default createContext<IntlMessages | null>(null);

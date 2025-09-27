import { createContext } from "react";

export default createContext<(() => Promise<void>) | undefined>(undefined);

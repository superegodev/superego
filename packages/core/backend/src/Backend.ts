import { backendContracts } from "./contracts/backendContracts.js";
import type { DeriveBackend } from "./contracts/contractUtils.js";

type Backend = DeriveBackend<typeof backendContracts>;
export default Backend;

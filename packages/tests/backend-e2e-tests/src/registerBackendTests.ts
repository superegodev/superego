import type Dependencies from "./Dependencies.js";
import factotumAssistant from "./suites/factotum-assistant/factotum-assistant.js";

export type { BooleanOracle, default as Dependencies } from "./Dependencies.js";

export default function registerBackendTests(
  deps: () => Promise<Dependencies>,
) {
  factotumAssistant(deps);
}

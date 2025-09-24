import type Dependencies from "./Dependencies.js";
import factotum from "./factotum/factotum.js";

export default function registerTests(deps: () => Promise<Dependencies>) {
  factotum(deps);
}

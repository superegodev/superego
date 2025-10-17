import factotum from "./factotum/factotum.js";
import type GetDependencies from "./GetDependencies.js";

export default function registerTests(deps: GetDependencies) {
  factotum(deps);
}

import type Dependencies from "./Dependencies.js";
import collectionCategories from "./suites/collection-categories.js";

export default function registerTests(deps: () => Promise<Dependencies>) {
  collectionCategories(deps);
}

import type Dependencies from "./Dependencies.js";
import collectionCategories from "./suites/collection-categories.js";
import collections from "./suites/collections.js";

export default function registerTests(deps: () => Promise<Dependencies>) {
  collectionCategories(deps);
  collections(deps);
}

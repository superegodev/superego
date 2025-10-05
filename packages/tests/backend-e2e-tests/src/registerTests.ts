import type GetDependencies from "./GetDependencies.js";
import collectionCategories from "./suites/collection-categories.js";
import collections from "./suites/collections.js";
import documents from "./suites/documents.js";

export default function registerTests(deps: GetDependencies) {
  collectionCategories(deps);
  collections(deps);
  documents(deps);
}

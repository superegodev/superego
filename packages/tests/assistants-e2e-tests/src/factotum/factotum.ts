import { describe } from "vitest";
import type GetDependencies from "../GetDependencies.js";
import aggregateOverSingleCollection from "./suites/aggregate-over-single-collection.js";
import createInMultipleCollections from "./suites/create-in-multiple-collections.js";
import createInSingleCollection from "./suites/create-in-single-collection.js";
import searchInSingleCollection from "./suites/search-in-single-collection.js";
import speakInDifferentLanguages from "./suites/speak-in-different-languages.js";
import updateInSingleCollection from "./suites/update-in-single-collection.js";

export default function registerFactotumTests(deps: GetDependencies) {
  describe("Factotum assistant", () => {
    // TODO: aggregateOverMultipleCollection(deps);
    aggregateOverSingleCollection(deps);
    createInMultipleCollections(deps);
    createInSingleCollection(deps);
    // TODO: searchInMultipleCollection(deps);
    searchInSingleCollection(deps);
    speakInDifferentLanguages(deps);
    // TODO: updateInMultipleCollection(deps);
    updateInSingleCollection(deps);
  });
}

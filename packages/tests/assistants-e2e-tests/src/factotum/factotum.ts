import { describe } from "vitest";
import type Dependencies from "../Dependencies.js";
import createInSingleCollection from "./suites/create-in-single-collection.js";

export default function registerFactotumTests(
  deps: () => Promise<Dependencies>,
) {
  describe("Factotum assistant", () => {
    createInSingleCollection(deps);
  });
}

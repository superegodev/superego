import { describe } from "vitest";
import type Dependencies from "../Dependencies.js";
import singleCollection from "./suites/single-collection.js";

export default function registerFactotumTests(
  deps: () => Promise<Dependencies>,
) {
  describe("Factotum assistant", () => {
    singleCollection(deps);
  });
}

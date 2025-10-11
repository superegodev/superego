import { describe, expect, it } from "vitest";
import type SessionStorage from "../SessionStorage.js";

export default function registerSessionStorageTests(
  deps: () => SessionStorage,
) {
  describe("getItem", () => {
    it("case: item doesn't exist", () => {
      // Setup SUT
      const sessionStorage = deps();

      // Exercise
      const value = sessionStorage.getItem("key");

      // Verify
      expect(value).toEqual(null);
    });

    it("case: item exists", () => {
      // Setup SUT
      const sessionStorage = deps();
      sessionStorage.setItem("key", "value");

      // Exercise
      const value = sessionStorage.getItem("key");

      // Verify
      expect(value).toEqual("value");
    });
  });

  describe("setItem", () => {
    it("case: item doesn't exist", () => {
      // Setup SUT
      const sessionStorage = deps();

      // Exercise
      sessionStorage.setItem("key", "value");

      // Verify
      expect(sessionStorage.getItem("key")).toEqual("value");
    });

    it("case: item exists, set to another string value", () => {
      // Setup SUT
      const sessionStorage = deps();
      sessionStorage.setItem("key", "value");

      // Exercise
      sessionStorage.setItem("key", "different-value");

      // Verify
      expect(sessionStorage.getItem("key")).toEqual("different-value");
    });

    it("case: item exists, set to null", () => {
      // Setup SUT
      const sessionStorage = deps();
      sessionStorage.setItem("key", "value");

      // Exercise
      sessionStorage.setItem("key", null);

      // Verify
      expect(sessionStorage.getItem("key")).toEqual(null);
    });
  });
}

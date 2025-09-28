import { Id } from "@superego/shared-utils";
import { describe, expect, it } from "vitest";
import DocumentUtils from "./DocumentUtils.js";

describe("getDisplayName", () => {
  describe("gets the display name of a document, i.e. the value of its first content summary property", () => {
    it("case: document with at least one content summary property", () => {
      // Exercise
      const document = {
        id: Id.generate.document(),
        latestVersion: {
          contentSummary: {
            success: true,
            data: {
              "{position:0} First Name": "First Name",
              "{position:1} Last Name": "Last Name",
            },
            error: null,
          },
        },
      };
      const displayName = DocumentUtils.getDisplayName(document as any);

      // Verify
      expect(displayName).toEqual("First Name");
    });

    it("case: document with no content summary properties", () => {
      // Exercise
      const document = {
        id: Id.generate.document(),
        latestVersion: {
          contentSummary: {
            success: true,
            data: {},
            error: null,
          },
        },
      };
      const displayName = DocumentUtils.getDisplayName(document as any);

      // Verify
      expect(displayName).toEqual(document.id);
    });

    it("case: document with failed content summary", () => {
      // Exercise
      const document = {
        id: Id.generate.document(),
        latestVersion: {
          contentSummary: {
            success: false,
            data: null,
            error: {},
          },
        },
      };
      const displayName = DocumentUtils.getDisplayName(document as any);

      // Verify
      expect(displayName).toEqual(document.id);
    });
  });
});

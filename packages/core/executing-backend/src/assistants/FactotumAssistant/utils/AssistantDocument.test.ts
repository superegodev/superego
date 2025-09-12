import type { Document } from "@superego/backend";
import { Id } from "@superego/shared-utils";
import { describe, expect, it } from "vitest";
import { toAssistantDocument } from "./AssistantDocument.js";

describe("toAssistantDocument", () => {
  it("converts a Document into an AssistantDocument", () => {
    // Exercise
    const document: Document = {
      id: Id.generate.document(),
      collectionId: Id.generate.collection(),
      latestVersion: {
        id: Id.generate.documentVersion(),
        collectionVersionId: Id.generate.collectionVersion(),
        previousVersionId: null,
        content: {
          string: "string",
        },
        summaryProperties: [
          { name: "name", value: "value", valueComputationError: null },
        ],
        createdAt: new Date(),
      },
      createdAt: new Date(),
    };
    const assistantDocument = toAssistantDocument(document);

    // Verify
    expect(assistantDocument).toEqual({
      id: document.id,
      versionId: document.latestVersion.id,
      content: {
        string: "string",
      },
    });
  });
});

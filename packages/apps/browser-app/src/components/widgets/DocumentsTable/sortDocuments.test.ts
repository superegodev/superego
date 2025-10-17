import type { LiteDocument } from "@superego/backend";
import { Id } from "@superego/shared-utils";
import { describe, expect, it } from "vitest";
import sortDocuments from "./sortDocuments.js";

const sortableColumnIds = {
  propertyPrefix: "propertyPrefix",
  createdAt: "createdAt",
  lastModifiedAt: "lastModifiedAt",
};

interface DocumentDefinition {
  createdAt?: Date;
  lastModifiedAt?: Date;
  contentSummary?: Record<string, unknown>;
  contentSummarySuccess?: boolean;
}

function makeTestDocument({
  createdAt,
  lastModifiedAt,
  contentSummary,
  contentSummarySuccess = true,
}: DocumentDefinition): LiteDocument {
  return {
    id: Id.generate.document(),
    createdAt: createdAt,
    latestVersion: {
      contentSummary: contentSummarySuccess
        ? { success: true, data: contentSummary, error: null }
        : { success: false, data: null, error: {} },
      createdAt: lastModifiedAt,
    },
  } as unknown as LiteDocument;
}

describe("sorts according to the sort descriptor", () => {
  it("case: createdAt, ascending", () => {
    // Exercise
    const documents = [
      makeTestDocument({ createdAt: new Date(1) }),
      makeTestDocument({ createdAt: new Date(2) }),
      makeTestDocument({ createdAt: new Date(0) }),
    ];
    const sortedDocuments = sortDocuments(
      documents,
      { column: sortableColumnIds.createdAt, direction: "ascending" },
      sortableColumnIds,
    );

    // Verify
    expect(sortedDocuments.map(({ id }) => id)).toEqual([
      documents[2]!.id,
      documents[0]!.id,
      documents[1]!.id,
    ]);
  });

  it("case: lastModifiedAt, descending", () => {
    // Exercise
    const documents = [
      makeTestDocument({ lastModifiedAt: new Date(1) }),
      makeTestDocument({ lastModifiedAt: new Date(2) }),
      makeTestDocument({ lastModifiedAt: new Date(0) }),
    ];
    const sortedDocuments = sortDocuments(
      documents,
      { column: sortableColumnIds.lastModifiedAt, direction: "descending" },
      sortableColumnIds,
    );

    // Verify
    expect(sortedDocuments.map(({ id }) => id)).toEqual([
      documents[1]!.id,
      documents[0]!.id,
      documents[2]!.id,
    ]);
  });

  it("case: sortable property, descending", () => {
    // Exercise
    const propertyName = "propertyName";
    const documents = [
      makeTestDocument({
        contentSummary: { [propertyName]: null },
      }),
      makeTestDocument({
        contentSummary: { [propertyName]: undefined },
      }),
      makeTestDocument({
        contentSummary: { [propertyName]: false },
      }),
      makeTestDocument({
        contentSummary: { [propertyName]: 1 },
      }),
      makeTestDocument({
        contentSummary: { [propertyName]: "1" },
      }),
      makeTestDocument({
        contentSummary: { [propertyName]: "2" },
      }),
    ];
    const sortedDocuments = sortDocuments(
      documents,
      {
        column: `${sortableColumnIds.propertyPrefix}${propertyName}`,
        direction: "descending",
      },
      sortableColumnIds,
    );

    // Verify
    expect(sortedDocuments.map(({ id }) => id)).toEqual([
      documents[5]!.id,
      documents[4]!.id,
      documents[3]!.id,
      documents[2]!.id,
      documents[1]!.id,
      documents[0]!.id,
    ]);
  });
});

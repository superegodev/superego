import { DocumentVersionCreator } from "@superego/backend";
import type {
  Collection,
  CollectionCategory,
  Document,
} from "@superego/backend";
import { describe, expect, it } from "vitest";
import {
  summarizeCollection,
  summarizeCollectionCategory,
  summarizeCollections,
  summarizeDocument,
  summarizeDocuments,
} from "./successSummaries.js";

describe("successSummaries", () => {
  it("summarizes documents without content or timestamps", () => {
    // Setup SUT
    const document = makeDocument();

    // Exercise
    const summary = summarizeDocument(document);

    // Verify
    expect(summary).toEqual({
      id: "Document_1",
      collectionId: "Collection_1",
      latestVersionId: "DocumentVersion_2",
      previousVersionId: "DocumentVersion_1",
      collectionVersionId: "CollectionVersion_1",
    });
    expect(summary).not.toHaveProperty("latestVersion");
    expect(summary).not.toHaveProperty("createdAt");
  });

  it("summarizes document arrays", () => {
    // Setup SUT
    const documents = [
      makeDocument({
        id: "Document_1",
        latestVersionId: "DocumentVersion_1",
      }),
      makeDocument({
        id: "Document_2",
        latestVersionId: "DocumentVersion_2",
      }),
    ];

    // Exercise
    const summaries = summarizeDocuments(documents);

    // Verify
    expect(summaries).toEqual([
      {
        id: "Document_1",
        collectionId: "Collection_1",
        latestVersionId: "DocumentVersion_1",
        previousVersionId: "DocumentVersion_1",
        collectionVersionId: "CollectionVersion_1",
      },
      {
        id: "Document_2",
        collectionId: "Collection_1",
        latestVersionId: "DocumentVersion_2",
        previousVersionId: "DocumentVersion_1",
        collectionVersionId: "CollectionVersion_1",
      },
    ]);
  });

  it("summarizes collections without schema, settings, migration, or timestamps", () => {
    // Setup SUT
    const collection = makeCollection();

    // Exercise
    const summary = summarizeCollection(collection);

    // Verify
    expect(summary).toEqual({
      id: "Collection_1",
      latestVersionId: "CollectionVersion_2",
      previousVersionId: "CollectionVersion_1",
    });
    expect(summary).not.toHaveProperty("latestVersion");
    expect(summary).not.toHaveProperty("settings");
    expect(summary).not.toHaveProperty("createdAt");
  });

  it("summarizes collection arrays", () => {
    // Setup SUT
    const collections = [
      makeCollection({
        id: "Collection_1",
        latestVersionId: "CollectionVersion_1",
      }),
      makeCollection({
        id: "Collection_2",
        latestVersionId: "CollectionVersion_2",
      }),
    ];

    // Exercise
    const summaries = summarizeCollections(collections);

    // Verify
    expect(summaries).toEqual([
      {
        id: "Collection_1",
        latestVersionId: "CollectionVersion_1",
        previousVersionId: "CollectionVersion_1",
      },
      {
        id: "Collection_2",
        latestVersionId: "CollectionVersion_2",
        previousVersionId: "CollectionVersion_1",
      },
    ]);
  });

  it("summarizes collection categories to id only", () => {
    // Setup SUT
    const collectionCategory = {
      id: "CollectionCategory_1",
      name: "Finance",
      icon: "credit-card",
      parentId: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    } as CollectionCategory;

    // Exercise
    const summary = summarizeCollectionCategory(collectionCategory);

    // Verify
    expect(summary).toEqual({ id: "CollectionCategory_1" });
  });
});

function makeDocument(
  overrides: { id?: string; latestVersionId?: string } = {},
): Document {
  return {
    id: overrides.id ?? "Document_1",
    collectionId: "Collection_1",
    latestVersion: {
      id: overrides.latestVersionId ?? "DocumentVersion_2",
      collectionVersionId: "CollectionVersion_1",
      previousVersionId: "DocumentVersion_1",
      conversationId: null,
      content: { title: "Hidden" },
      contentSummary: { success: true, data: {}, error: null },
      createdBy: DocumentVersionCreator.User,
      createdAt: new Date("2026-01-02T00:00:00.000Z"),
    },
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  } as Document;
}

function makeCollection(
  overrides: { id?: string; latestVersionId?: string } = {},
): Collection {
  return {
    id: overrides.id ?? "Collection_1",
    latestVersion: {
      id: overrides.latestVersionId ?? "CollectionVersion_2",
      previousVersionId: "CollectionVersion_1",
      schema: { types: {}, rootType: "Root" },
      settings: {
        contentSummaryGetter: { source: "", compiled: "" },
        contentBlockingKeysGetter: null,
        defaultDocumentViewUiOptions: null,
      },
      migration: null,
      createdAt: new Date("2026-01-02T00:00:00.000Z"),
    },
    settings: {
      name: "Expenses",
      icon: null,
      collectionCategoryId: null,
      defaultCollectionViewAppId: null,
      description: null,
      assistantInstructions: null,
      redirectToCollectionAfterDocumentCreation: false,
    },
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  } as Collection;
}

import type { App, Collection, Document } from "@superego/backend";
import { expect } from "vitest";
import type { DatabaseSnapshot } from "./snapshot.js";

export function findCollectionByName(
  snapshot: DatabaseSnapshot,
  name: RegExp,
): Collection {
  const statelessName = makeStatelessRegExp(name);
  const collection = snapshot.collections.find((candidate) =>
    statelessName.test(candidate.settings.name),
  );
  expect(collection).toBeDefined();
  return collection!;
}

export function findDocuments(
  snapshot: DatabaseSnapshot,
  collectionId: string,
): Document[] {
  return snapshot.documentsByCollectionId[collectionId] ?? [];
}

export function expectSchemaHasConcepts(
  collection: Collection,
  concepts: string[][],
): void {
  const searchableSchema = JSON.stringify(collection.latestVersion.schema)
    .replaceAll(/[^a-zA-Z0-9]+/g, " ")
    .toLowerCase();
  for (const alternatives of concepts) {
    expect(
      alternatives.some((alternative) =>
        searchableSchema.includes(alternative.toLowerCase()),
      ),
      `schema missing concept: ${alternatives.join("/")}`,
    ).toBe(true);
  }
}

export function expectDocumentContentIncludes(
  documents: Document[],
  expected: Record<string, unknown>,
): void {
  const searchableDocuments = documents.map((document) =>
    JSON.stringify(document.latestVersion.content).toLowerCase(),
  );
  for (const value of Object.values(expected)) {
    expect(
      searchableDocuments.some((searchableDocument) =>
        searchableDocument.includes(String(value).toLowerCase()),
      ),
      `documents missing value: ${String(value)}`,
    ).toBe(true);
  }
}

export function expectSingleChangedDocument(
  before: Document[],
  after: Document[],
): void {
  const beforeById = new Map(before.map((document) => [document.id, document]));
  const changed = after.filter((document) => {
    const previous = beforeById.get(document.id);
    return (
      previous &&
      JSON.stringify(previous.latestVersion.content) !==
        JSON.stringify(document.latestVersion.content)
    );
  });
  expect(changed).toHaveLength(1);
}

export function findAppByName(apps: App[], name: RegExp): App {
  const statelessName = makeStatelessRegExp(name);
  const app = apps.find((candidate) => statelessName.test(candidate.name));
  expect(app).toBeDefined();
  return app!;
}

function makeStatelessRegExp(regExp: RegExp): RegExp {
  return new RegExp(regExp.source, regExp.flags.replace(/[gy]/g, ""));
}

import type {
  Backend,
  CollectionId,
  Document,
  DocumentId,
} from "@superego/backend";
import { assert, expect } from "vitest";
import assertSuccessfulResult from "../../utils/assertSuccessfulResult.js";

export interface ExpectedDocumentsState {
  created: object[];
  updated: { document: Document; newContentMatching: object }[];
  unmodified: Document[];
}

export default async function expectCollectionState(
  backend: Backend,
  collectionId: CollectionId,
  expectedDocumentsState: ExpectedDocumentsState,
): Promise<void> {
  const listDocumentsResult = await backend.documents.list(collectionId);
  assertSuccessfulResult(
    `Error listing documents for collection ${collectionId}`,
    listDocumentsResult,
  );
  const { data: foundDocuments } = listDocumentsResult;

  expect(
    foundDocuments.length,
    "Database contains an unexpected number of documents",
  ).toEqual(
    expectedDocumentsState.created.length +
      expectedDocumentsState.updated.length +
      expectedDocumentsState.unmodified.length,
  );

  const foundDocumentsById: Record<DocumentId, Document> = {};
  for (const document of foundDocuments) {
    foundDocumentsById[document.id] = document;
  }

  expectedDocumentsState.unmodified.forEach((document, index) => {
    const supposedlyUnmodifiedDocument = foundDocumentsById[document.id];
    assert.isDefined(
      supposedlyUnmodifiedDocument,
      `Document at unmodified[${index}] should have been unmodified, but it was not found in the database.`,
    );
    expect(
      supposedlyUnmodifiedDocument.latestVersion.id,
      `Document at unmodified[${index}] should have been unmodified, but it was updated.`,
    ).toEqual(document.latestVersion.id);
    delete foundDocumentsById[document.id];
  });

  expectedDocumentsState.updated.forEach(
    ({ document, newContentMatching }, index) => {
      const supposedlyUpdatedDocument = foundDocumentsById[document.id];
      assert.isDefined(
        supposedlyUpdatedDocument,
        `Document at updated[${index}] should have been updated, but it was not found in the database.`,
      );
      expect(
        supposedlyUpdatedDocument.latestVersion.id,
        `Document at updated[${index}] should have been updated, but it was not.`,
      ).not.toEqual(document.latestVersion.id);
      expect(supposedlyUpdatedDocument.latestVersion.content).toMatchObject(
        newContentMatching,
      );
      delete foundDocumentsById[document.id];
    },
  );

  // The updated and unmodified documents have now been deleted from the record.
  const supposedlyCreatedDocuments = Object.values(foundDocumentsById);
  expectedDocumentsState.created.forEach((contentMatching, index) => {
    expect(
      supposedlyCreatedDocuments.map(
        (supposedlyCreatedDocument) =>
          supposedlyCreatedDocument.latestVersion.content,
      ),
      `Document at created[${index}] should have been created, but it was not.`,
    ).toContainEqual(expect.objectContaining(contentMatching));
  });
}

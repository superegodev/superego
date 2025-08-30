import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect, it } from "vitest";
import type DocumentVersionEntity from "../../../entities/DocumentVersionEntity.js";
import type Dependencies from "../Dependencies.js";

const content = {
  string: "string",
  number: 0,
  boolean: true,
  object: {},
  array: [],
  null: null,
};

export default rd<Dependencies>("Document versions", (deps) => {
  it("inserting", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();

    // Exercise
    const documentVersion: DocumentVersionEntity = {
      id: Id.generate.documentVersion(),
      collectionId: Id.generate.collection(),
      documentId: Id.generate.document(),
      collectionVersionId: Id.generate.collectionVersion(),
      content: content,
      previousVersionId: null,
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.documentVersion.insert(documentVersion);
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.documentVersion.findLatestWhereDocumentIdEq(
          documentVersion.documentId,
        ),
      }),
    );
    expect(found).toEqual(documentVersion);
  });

  it("deleting all by collection id", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();
    const collection1Id = Id.generate.collection();
    const collection2Id = Id.generate.collection();
    const documentVersion1: DocumentVersionEntity = {
      id: Id.generate.documentVersion(),
      collectionId: collection1Id,
      documentId: Id.generate.document(),
      collectionVersionId: Id.generate.collectionVersion(),
      content: content,
      previousVersionId: null,
      createdAt: new Date(),
    };
    const documentVersion2: DocumentVersionEntity = {
      id: Id.generate.documentVersion(),
      collectionId: collection1Id,
      documentId: Id.generate.document(),
      collectionVersionId: Id.generate.collectionVersion(),
      content: content,
      previousVersionId: null,
      createdAt: new Date(),
    };
    const documentVersion3: DocumentVersionEntity = {
      id: Id.generate.documentVersion(),
      collectionId: collection2Id,
      documentId: Id.generate.document(),
      collectionVersionId: Id.generate.collectionVersion(),
      content: content,
      previousVersionId: null,
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.documentVersion.insert(documentVersion1);
        await repos.documentVersion.insert(documentVersion2);
        await repos.documentVersion.insert(documentVersion3);
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const deletedIds =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.documentVersion.deleteAllWhereCollectionIdEq(
              collection1Id,
            ),
        }),
      );

    // Verify
    expect(deletedIds).toEqual([documentVersion1.id, documentVersion2.id]);
    const collection1DocumentVersions =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.documentVersion.findAllLatestsWhereCollectionIdEq(
              collection1Id,
            ),
        }),
      );
    expect(collection1DocumentVersions).toEqual([]);
    const collection2DocumentVersions =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.documentVersion.findAllLatestsWhereCollectionIdEq(
              collection2Id,
            ),
        }),
      );
    expect(collection2DocumentVersions).toEqual([documentVersion3]);
  });

  it("deleting all by document id", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();
    const collectionId = Id.generate.collection();
    const document1Id = Id.generate.document();
    const document2Id = Id.generate.document();
    const documentVersion1: DocumentVersionEntity = {
      id: Id.generate.documentVersion(),
      collectionId: collectionId,
      documentId: document1Id,
      collectionVersionId: Id.generate.collectionVersion(),
      content: content,
      previousVersionId: null,
      createdAt: new Date(),
    };
    const documentVersion2: DocumentVersionEntity = {
      id: Id.generate.documentVersion(),
      collectionId: collectionId,
      documentId: document1Id,
      collectionVersionId: Id.generate.collectionVersion(),
      content: content,
      previousVersionId: documentVersion1.id,
      createdAt: new Date(),
    };
    const documentVersion3: DocumentVersionEntity = {
      id: Id.generate.documentVersion(),
      collectionId: collectionId,
      documentId: document2Id,
      collectionVersionId: Id.generate.collectionVersion(),
      content: content,
      previousVersionId: null,
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.documentVersion.insert(documentVersion1);
        await repos.documentVersion.insert(documentVersion2);
        await repos.documentVersion.insert(documentVersion3);
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const deletedIds =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.documentVersion.deleteAllWhereDocumentIdEq(document1Id),
        }),
      );

    // Verify
    expect(deletedIds).toEqual([documentVersion1.id, documentVersion2.id]);
    const latestDocumentVersions =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.documentVersion.findAllLatestsWhereCollectionIdEq(
              collectionId,
            ),
        }),
      );
    expect(latestDocumentVersions).toEqual([documentVersion3]);
  });

  describe("finding latest by document id", () => {
    it("case: exists => returns latest", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();
      const documentId = Id.generate.document();
      const documentVersion1: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        collectionId: Id.generate.collection(),
        documentId: documentId,
        collectionVersionId: Id.generate.collectionVersion(),
        content: content,
        previousVersionId: null,
        createdAt: new Date(),
      };
      const documentVersion2: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        collectionId: Id.generate.collection(),
        documentId: documentId,
        collectionVersionId: Id.generate.collectionVersion(),
        content: content,
        previousVersionId: documentVersion1.id,
        createdAt: new Date(),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.documentVersion.insert(documentVersion1);
          await repos.documentVersion.insert(documentVersion2);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.documentVersion.findLatestWhereDocumentIdEq(documentId),
        }),
      );

      // Verify
      expect(found).toEqual(documentVersion2);
    });

    it("case: doesn't exist => returns null", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.documentVersion.findLatestWhereDocumentIdEq(
            Id.generate.document(),
          ),
        }),
      );

      // Verify
      expect(found).toEqual(null);
    });
  });

  describe("finding all latests by collection id", () => {
    it("case: no document versions in collection => returns empty array", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.documentVersion.findAllLatestsWhereCollectionIdEq(
              Id.generate.collection(),
            ),
        }),
      );

      // Verify
      expect(found).toEqual([]);
    });

    it("case: some document versions in collection => returns latest of each document", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();
      const collectionId = Id.generate.collection();
      const document1Id = Id.generate.document();
      const document2Id = Id.generate.document();
      const documentVersion1: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        collectionId: collectionId,
        documentId: document1Id,
        collectionVersionId: Id.generate.collectionVersion(),
        content: content,
        previousVersionId: null,
        createdAt: new Date(),
      };
      const documentVersion2: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        collectionId: collectionId,
        documentId: document1Id,
        collectionVersionId: Id.generate.collectionVersion(),
        content: content,
        previousVersionId: documentVersion1.id,
        createdAt: new Date(),
      };
      const documentVersion3: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        collectionId: collectionId,
        documentId: document2Id,
        collectionVersionId: Id.generate.collectionVersion(),
        content: content,
        previousVersionId: null,
        createdAt: new Date(),
      };
      const documentVersion4: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        collectionId: Id.generate.collection(),
        documentId: Id.generate.document(),
        collectionVersionId: Id.generate.collectionVersion(),
        content: content,
        previousVersionId: null,
        createdAt: new Date(),
      };

      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.documentVersion.insert(documentVersion1);
          await repos.documentVersion.insert(documentVersion2);
          await repos.documentVersion.insert(documentVersion3);
          await repos.documentVersion.insert(documentVersion4);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.documentVersion.findAllLatestsWhereCollectionIdEq(
              collectionId,
            ),
        }),
      );

      // Verify
      expect(found).toEqual([documentVersion2, documentVersion3]);
    });
  });
});

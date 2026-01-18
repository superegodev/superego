import { DocumentVersionCreator } from "@superego/backend";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect, it } from "vitest";
import type DocumentVersionEntity from "../../../entities/DocumentVersionEntity.js";
import type MinimalDocumentVersionEntity from "../../../entities/MinimalDocumentVersionEntity.js";
import type GetDependencies from "../GetDependencies.js";

const content = {
  string: "string",
  number: 0,
  boolean: true,
  object: {},
  array: [],
  null: null,
};

export default rd<GetDependencies>("Document versions", (deps) => {
  it("inserting", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();

    // Exercise
    const documentVersion: DocumentVersionEntity = {
      id: Id.generate.documentVersion(),
      remoteId: null,
      collectionId: Id.generate.collection(),
      documentId: Id.generate.document(),
      collectionVersionId: Id.generate.collectionVersion(),
      conversationId: null,
      content: content,
      contentFingerprint: null,
      referencedDocuments: [],
      previousVersionId: null,
      createdBy: DocumentVersionCreator.User,
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
    const { dataRepositoriesManager } = deps();
    const collection1Id = Id.generate.collection();
    const collection2Id = Id.generate.collection();
    const documentVersion1: DocumentVersionEntity = {
      id: Id.generate.documentVersion(),
      remoteId: null,
      collectionId: collection1Id,
      documentId: Id.generate.document(),
      collectionVersionId: Id.generate.collectionVersion(),
      conversationId: null,
      content: content,
      contentFingerprint: null,
      referencedDocuments: [],
      previousVersionId: null,
      createdBy: DocumentVersionCreator.User,
      createdAt: new Date(),
    };
    const documentVersion2: DocumentVersionEntity = {
      id: Id.generate.documentVersion(),
      remoteId: null,
      collectionId: collection1Id,
      documentId: Id.generate.document(),
      collectionVersionId: Id.generate.collectionVersion(),
      conversationId: null,
      content: content,
      contentFingerprint: null,
      referencedDocuments: [],
      previousVersionId: null,
      createdBy: DocumentVersionCreator.User,
      createdAt: new Date(),
    };
    const documentVersion3: DocumentVersionEntity = {
      id: Id.generate.documentVersion(),
      remoteId: null,
      collectionId: collection2Id,
      documentId: Id.generate.document(),
      collectionVersionId: Id.generate.collectionVersion(),
      conversationId: null,
      content: content,
      contentFingerprint: null,
      referencedDocuments: [],
      previousVersionId: null,
      createdBy: DocumentVersionCreator.User,
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
    const { dataRepositoriesManager } = deps();
    const collectionId = Id.generate.collection();
    const document1Id = Id.generate.document();
    const document2Id = Id.generate.document();
    const documentVersion1: DocumentVersionEntity = {
      id: Id.generate.documentVersion(),
      remoteId: null,
      collectionId: collectionId,
      documentId: document1Id,
      collectionVersionId: Id.generate.collectionVersion(),
      conversationId: null,
      content: content,
      contentFingerprint: null,
      referencedDocuments: [],
      previousVersionId: null,
      createdBy: DocumentVersionCreator.User,
      createdAt: new Date(),
    };
    const documentVersion2: DocumentVersionEntity = {
      id: Id.generate.documentVersion(),
      remoteId: null,
      collectionId: collectionId,
      documentId: document1Id,
      collectionVersionId: Id.generate.collectionVersion(),
      conversationId: null,
      content: content,
      contentFingerprint: null,
      referencedDocuments: [],
      previousVersionId: documentVersion1.id,
      createdBy: DocumentVersionCreator.User,
      createdAt: new Date(),
    };
    const documentVersion3: DocumentVersionEntity = {
      id: Id.generate.documentVersion(),
      remoteId: null,
      collectionId: collectionId,
      documentId: document2Id,
      collectionVersionId: Id.generate.collectionVersion(),
      conversationId: null,
      content: content,
      contentFingerprint: null,
      referencedDocuments: [],
      previousVersionId: null,
      createdBy: DocumentVersionCreator.User,
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

  describe("finding one", () => {
    it("case: exists, latest => returns it", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const documentVersion: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: Id.generate.collection(),
        documentId: Id.generate.document(),
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentFingerprint: null,
        referencedDocuments: [],
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.documentVersion.insert(documentVersion);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.documentVersion.find(documentVersion.id),
        }),
      );

      // Verify
      expect(found).toEqual(documentVersion);
    });

    it("case: exists, not latest => returns it", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const documentId = Id.generate.document();
      const documentVersion1: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: Id.generate.collection(),
        documentId: documentId,
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: { ...content, number: 1 },
        contentFingerprint: null,
        referencedDocuments: [],
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(),
      };
      const documentVersion2: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: Id.generate.collection(),
        documentId: documentId,
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: { ...content, number: 2 },
        contentFingerprint: null,
        referencedDocuments: [],
        previousVersionId: documentVersion1.id,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(),
      };
      const documentVersion3: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: Id.generate.collection(),
        documentId: documentId,
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: { ...content, number: 3 },
        contentFingerprint: null,
        referencedDocuments: [],
        previousVersionId: documentVersion2.id,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(),
      };
      const documentVersion4: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: Id.generate.collection(),
        documentId: documentId,
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: { ...content, number: 4 },
        contentFingerprint: null,
        referencedDocuments: [],
        previousVersionId: documentVersion3.id,
        createdBy: DocumentVersionCreator.User,
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
          returnValue: await repos.documentVersion.find(documentVersion3.id),
        }),
      );

      // Verify
      expect(found).toEqual(documentVersion3);
    });

    it("case: doesn't exist => returns null", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.documentVersion.find(
            Id.generate.documentVersion(),
          ),
        }),
      );

      // Verify
      expect(found).toEqual(null);
    });
  });

  describe("finding latest by document id", () => {
    it("case: exists => returns latest", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const documentId = Id.generate.document();
      const documentVersion1: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: Id.generate.collection(),
        documentId: documentId,
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentFingerprint: null,
        referencedDocuments: [],
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(),
      };
      const documentVersion2: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: Id.generate.collection(),
        documentId: documentId,
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentFingerprint: null,
        referencedDocuments: [],
        previousVersionId: documentVersion1.id,
        createdBy: DocumentVersionCreator.User,
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
      const { dataRepositoriesManager } = deps();

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

  describe("finding all (minimal) by document id", () => {
    const toMinimal = ({
      content,
      ...rest
    }: DocumentVersionEntity): MinimalDocumentVersionEntity => rest;

    it("case: no document versions => returns empty array", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.documentVersion.findAllWhereDocumentIdEq(
            Id.generate.document(),
          ),
        }),
      );

      // Verify
      expect(found).toEqual([]);
    });

    it("case: some document versions => returns all versions ordered by created_at desc", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const collectionId = Id.generate.collection();
      const document1Id = Id.generate.document();
      const document2Id = Id.generate.document();
      const documentVersion1: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: document1Id,
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: { ...content, number: 1 },
        referencedDocuments: [],
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(1),
        contentFingerprint: null,
      };
      const documentVersion2: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: document1Id,
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: { ...content, number: 2 },
        referencedDocuments: [],
        previousVersionId: documentVersion1.id,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(2),
        contentFingerprint: null,
      };
      const documentVersion3: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: document1Id,
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: { ...content, number: 3 },
        referencedDocuments: [],
        previousVersionId: documentVersion2.id,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(3),
        contentFingerprint: null,
      };
      // Different document - should not be included
      const documentVersion4: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: document2Id,
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentFingerprint: null,
        referencedDocuments: [],
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(4),
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
            await repos.documentVersion.findAllWhereDocumentIdEq(document1Id),
        }),
      );

      // Verify
      expect(found).toEqual([
        toMinimal(documentVersion3),
        toMinimal(documentVersion2),
        toMinimal(documentVersion1),
      ]);
    });

    it("case: single version => returns array with one element", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const documentId = Id.generate.document();
      const documentVersion: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: Id.generate.collection(),
        documentId: documentId,
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentFingerprint: null,
        referencedDocuments: [],
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(),
      };

      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.documentVersion.insert(documentVersion);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.documentVersion.findAllWhereDocumentIdEq(documentId),
        }),
      );

      // Verify
      expect(found).toEqual([toMinimal(documentVersion)]);
    });
  });

  describe("finding all latests by collection id", () => {
    it("case: no document versions in collection => returns empty array", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();

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
      const { dataRepositoriesManager } = deps();
      const collectionId = Id.generate.collection();
      const document1Id = Id.generate.document();
      const document2Id = Id.generate.document();
      const documentVersion1: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: document1Id,
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentFingerprint: null,
        referencedDocuments: [],
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(),
      };
      const documentVersion2: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: document1Id,
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentFingerprint: null,
        referencedDocuments: [],
        previousVersionId: documentVersion1.id,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(),
      };
      const documentVersion3: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: document2Id,
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentFingerprint: null,
        referencedDocuments: [],
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(),
      };
      const documentVersion4: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: Id.generate.collection(),
        documentId: Id.generate.document(),
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentFingerprint: null,
        referencedDocuments: [],
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
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

  describe("misc", () => {
    it("inserting versions with identical contents and retrieving them", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();

      // Exercise
      const collectionId = Id.generate.collection();
      const documentId = Id.generate.document();
      const documentVersion1: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: documentId,
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentFingerprint: null,
        referencedDocuments: [],
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(),
      };
      const documentVersion2: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: documentId,
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentFingerprint: null,
        referencedDocuments: [],
        previousVersionId: documentVersion1.id,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(),
      };
      const documentVersion3: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: documentId,
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentFingerprint: null,
        referencedDocuments: [],
        previousVersionId: documentVersion2.id,
        createdBy: DocumentVersionCreator.User,
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

      // Verify
      const { found1, found2, found3 } =
        await dataRepositoriesManager.runInSerializableTransaction(
          async (repos) => ({
            action: "commit",
            returnValue: {
              found1: await repos.documentVersion.find(documentVersion1.id),
              found2: await repos.documentVersion.find(documentVersion2.id),
              found3: await repos.documentVersion.find(documentVersion3.id),
            },
          }),
        );
      expect(found1).toEqual(documentVersion1);
      expect(found2).toEqual(documentVersion2);
      expect(found3).toEqual(documentVersion3);
    });
  });

  describe("finding all latest where referencedDocuments contains", () => {
    it("case: no documents reference the given document => returns empty array", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      // Create a document that doesn't reference the target
      const documentVersion1: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: Id.generate.collection(),
        documentId: Id.generate.document(),
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentFingerprint: null,
        referencedDocuments: [],
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.documentVersion.insert(documentVersion1);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const targetCollectionId = Id.generate.collection();
      const targetDocumentId = Id.generate.document();
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.documentVersion.findAllLatestWhereReferencedDocumentsContains(
              targetCollectionId,
              targetDocumentId,
            ),
        }),
      );

      // Verify
      expect(found).toEqual([]);
    });

    it("case: some documents reference the given document => returns those documents", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const targetCollectionId = Id.generate.collection();
      const targetDocumentId = Id.generate.document();

      // Document that references the target
      const documentVersion1: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: Id.generate.collection(),
        documentId: Id.generate.document(),
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentFingerprint: null,
        referencedDocuments: [
          { collectionId: targetCollectionId, documentId: targetDocumentId },
        ],
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(),
      };

      // Document that doesn't reference the target
      const documentVersion2: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: Id.generate.collection(),
        documentId: Id.generate.document(),
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentFingerprint: null,
        referencedDocuments: [],
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
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
            await repos.documentVersion.findAllLatestWhereReferencedDocumentsContains(
              targetCollectionId,
              targetDocumentId,
            ),
        }),
      );

      // Verify
      expect(found).toEqual([documentVersion1]);
    });

    it("case: only returns latest versions", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const targetCollectionId = Id.generate.collection();
      const targetDocumentId = Id.generate.document();
      const referencingDocumentId = Id.generate.document();

      // Older version that references the target
      const documentVersion1: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: Id.generate.collection(),
        documentId: referencingDocumentId,
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentFingerprint: null,
        referencedDocuments: [
          { collectionId: targetCollectionId, documentId: targetDocumentId },
        ],
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(1),
      };

      // Newer version that also references the target
      const documentVersion2: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: documentVersion1.collectionId,
        documentId: referencingDocumentId,
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentFingerprint: null,
        referencedDocuments: [
          { collectionId: targetCollectionId, documentId: targetDocumentId },
        ],
        previousVersionId: documentVersion1.id,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(2),
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
            await repos.documentVersion.findAllLatestWhereReferencedDocumentsContains(
              targetCollectionId,
              targetDocumentId,
            ),
        }),
      );

      // Verify
      expect(found).toEqual([documentVersion2]);
    });

    it("case: multiple documents reference the same target => returns all", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const targetCollectionId = Id.generate.collection();
      const targetDocumentId = Id.generate.document();

      // First document that references the target
      const documentVersion1: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: Id.generate.collection(),
        documentId: Id.generate.document(),
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentFingerprint: null,
        referencedDocuments: [
          { collectionId: targetCollectionId, documentId: targetDocumentId },
        ],
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(),
      };

      // Second document that references the target
      const documentVersion2: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: Id.generate.collection(),
        documentId: Id.generate.document(),
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentFingerprint: null,
        referencedDocuments: [
          { collectionId: targetCollectionId, documentId: targetDocumentId },
        ],
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
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
            await repos.documentVersion.findAllLatestWhereReferencedDocumentsContains(
              targetCollectionId,
              targetDocumentId,
            ),
        }),
      );

      // Verify
      expect(found).toEqual([documentVersion1, documentVersion2]);
    });
  });
});

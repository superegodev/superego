import type { DocumentVersion } from "@superego/backend";
import { DocumentVersionCreator } from "@superego/backend";
import { Id, makeSuccessfulResult } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it } from "vitest";
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

const contentSummary: DocumentVersion["contentSummary"] = makeSuccessfulResult(
  {},
);

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
      contentBlockingKeys: null,
      referencedDocuments: [],
      contentSummary: contentSummary,
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

  describe("updating content blocking keys", () => {
    it("updates contentBlockingKeys from null to an array", async () => {
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
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
      const newContentBlockingKeys = ["key:1", "key:2"];
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.documentVersion.updateContentBlockingKeys(
            documentVersion.id,
            newContentBlockingKeys,
          );
          return { action: "commit", returnValue: null };
        },
      );

      // Verify
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.documentVersion.find(documentVersion.id),
        }),
      );
      expect(found?.contentBlockingKeys).toEqual(newContentBlockingKeys);
    });

    it("updates contentBlockingKeys from an array to a different array", async () => {
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
        contentBlockingKeys: ["key:old1", "key:old2"],
        referencedDocuments: [],
        contentSummary: contentSummary,
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
      const newContentBlockingKeys = ["key:new1", "key:new2", "key:new3"];
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.documentVersion.updateContentBlockingKeys(
            documentVersion.id,
            newContentBlockingKeys,
          );
          return { action: "commit", returnValue: null };
        },
      );

      // Verify
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.documentVersion.find(documentVersion.id),
        }),
      );
      expect(found?.contentBlockingKeys).toEqual(newContentBlockingKeys);
    });

    it("updates contentBlockingKeys from an array to null", async () => {
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
        contentBlockingKeys: ["key:1", "key:2"],
        referencedDocuments: [],
        contentSummary: contentSummary,
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
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.documentVersion.updateContentBlockingKeys(
            documentVersion.id,
            null,
          );
          return { action: "commit", returnValue: null };
        },
      );

      // Verify
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.documentVersion.find(documentVersion.id),
        }),
      );
      expect(found?.contentBlockingKeys).toEqual(null);
    });
  });

  describe("updating content summary", () => {
    it("updates contentSummary for an existing document version (case: successful result)", async () => {
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
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
      const newContentSummary: DocumentVersion["contentSummary"] =
        makeSuccessfulResult({ title: "Updated Title" });
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.documentVersion.updateContentSummary(
            documentVersion.id,
            newContentSummary,
          );
          return { action: "commit", returnValue: null };
        },
      );

      // Verify
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.documentVersion.find(documentVersion.id),
        }),
      );
      expect(found?.contentSummary).toEqual(newContentSummary);
    });

    it("updates contentSummary for an existing document version (case: unsuccessful result)", async () => {
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
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
      const newContentSummary: DocumentVersion["contentSummary"] = {
        success: false,
        data: null,
        error: {
          name: "ContentSummaryNotValid",
          details: {
            collectionId: documentVersion.collectionId,
            collectionVersionId: documentVersion.collectionVersionId,
            documentId: documentVersion.documentId,
            documentVersionId: documentVersion.id,
            issues: [{ message: "Invalid content summary" }],
          },
        },
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.documentVersion.updateContentSummary(
            documentVersion.id,
            newContentSummary,
          );
          return { action: "commit", returnValue: null };
        },
      );

      // Verify
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.documentVersion.find(documentVersion.id),
        }),
      );
      expect(found?.contentSummary).toEqual(newContentSummary);
    });
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
      contentBlockingKeys: null,
      referencedDocuments: [],
      contentSummary: contentSummary,
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
      contentBlockingKeys: null,
      referencedDocuments: [],
      contentSummary: contentSummary,
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
      contentBlockingKeys: null,
      referencedDocuments: [],
      contentSummary: contentSummary,
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
      contentBlockingKeys: null,
      referencedDocuments: [],
      contentSummary: contentSummary,
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
      contentBlockingKeys: null,
      referencedDocuments: [],
      contentSummary: contentSummary,
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
      contentBlockingKeys: null,
      referencedDocuments: [],
      contentSummary: contentSummary,
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
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
      contentBlockingKeys,
      contentSummary,
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
        contentSummary: contentSummary,
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(1),
        contentBlockingKeys: null,
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
        contentSummary: contentSummary,
        previousVersionId: documentVersion1.id,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(2),
        contentBlockingKeys: null,
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
        contentSummary: contentSummary,
        previousVersionId: documentVersion2.id,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(3),
        contentBlockingKeys: null,
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
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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

  describe("finding all by collection version id", () => {
    it("case: no document versions for collection version => returns empty array", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.documentVersion.findAllWhereCollectionVersionIdEq(
              Id.generate.collectionVersion(),
            ),
        }),
      );

      // Verify
      expect(found).toEqual([]);
    });

    it("case: some document versions for collection version => returns all of them", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const collectionVersionId = Id.generate.collectionVersion();
      const otherCollectionVersionId = Id.generate.collectionVersion();
      const collectionId = Id.generate.collection();

      // Document versions under the target collection version.
      const documentVersion1: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: Id.generate.document(),
        collectionVersionId: collectionVersionId,
        conversationId: null,
        content: content,
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(),
      };
      const documentVersion2: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: Id.generate.document(),
        collectionVersionId: collectionVersionId,
        conversationId: null,
        content: content,
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(),
      };
      // Document version under a different collection version - should not be
      // included.
      const documentVersion3: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: Id.generate.document(),
        collectionVersionId: otherCollectionVersionId,
        conversationId: null,
        content: content,
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.documentVersion.findAllWhereCollectionVersionIdEq(
              collectionVersionId,
            ),
        }),
      );

      // Verify
      expect(found).toEqual([documentVersion1, documentVersion2]);
    });

    it("case: also includes non-latest versions", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const collectionVersionId = Id.generate.collectionVersion();
      const collectionId = Id.generate.collection();
      const documentId = Id.generate.document();

      // First version (non latest).
      const documentVersion1: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: documentId,
        collectionVersionId: collectionVersionId,
        conversationId: null,
        content: { ...content, number: 1 },
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(1),
      };
      // Second version (latest).
      const documentVersion2: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: documentId,
        collectionVersionId: collectionVersionId,
        conversationId: null,
        content: { ...content, number: 2 },
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
            await repos.documentVersion.findAllWhereCollectionVersionIdEq(
              collectionVersionId,
            ),
        }),
      );

      // Verify
      expect(found).toEqual([documentVersion1, documentVersion2]);
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
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
        contentBlockingKeys: null,
        referencedDocuments: [
          { collectionId: targetCollectionId, documentId: targetDocumentId },
        ],
        contentSummary: contentSummary,
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
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
        contentBlockingKeys: null,
        referencedDocuments: [
          { collectionId: targetCollectionId, documentId: targetDocumentId },
        ],
        contentSummary: contentSummary,
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
        contentBlockingKeys: null,
        referencedDocuments: [
          { collectionId: targetCollectionId, documentId: targetDocumentId },
        ],
        contentSummary: contentSummary,
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
        contentBlockingKeys: null,
        referencedDocuments: [
          { collectionId: targetCollectionId, documentId: targetDocumentId },
        ],
        contentSummary: contentSummary,
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
        contentBlockingKeys: null,
        referencedDocuments: [
          { collectionId: targetCollectionId, documentId: targetDocumentId },
        ],
        contentSummary: contentSummary,
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

  describe("finding any latest by collectionId and contentBlockingKeys overlap", () => {
    it("case: no document versions with overlapping blocking keys => returns null", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const collectionId = Id.generate.collection();
      const documentVersion: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: Id.generate.document(),
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentBlockingKeys: ["key:1", "key:2"],
        referencedDocuments: [],
        contentSummary: contentSummary,
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
            await repos.documentVersion.findAnyLatestWhereCollectionIdEqAndContentBlockingKeysOverlap(
              collectionId,
              ["key:3", "key:4"],
            ),
        }),
      );

      // Verify
      expect(found).toEqual(null);
    });

    it("case: document version with overlapping blocking key exists => returns it", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const collectionId = Id.generate.collection();
      const documentVersion: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: Id.generate.document(),
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentBlockingKeys: ["key:1", "key:2"],
        referencedDocuments: [],
        contentSummary: contentSummary,
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
            await repos.documentVersion.findAnyLatestWhereCollectionIdEqAndContentBlockingKeysOverlap(
              collectionId,
              ["key:1", "key:3"],
            ),
        }),
      );

      // Verify
      expect(found).toEqual(documentVersion);
    });

    it("case: overlapping blocking keys in different collection => returns null", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const collection1Id = Id.generate.collection();
      const collection2Id = Id.generate.collection();
      const contentBlockingKeys = ["key:1", "key:2"];
      const documentVersion: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collection1Id,
        documentId: Id.generate.document(),
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentBlockingKeys: contentBlockingKeys,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
            await repos.documentVersion.findAnyLatestWhereCollectionIdEqAndContentBlockingKeysOverlap(
              collection2Id,
              contentBlockingKeys,
            ),
        }),
      );

      // Verify
      expect(found).toEqual(null);
    });

    it("case: only returns latest versions", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const collectionId = Id.generate.collection();
      const documentId = Id.generate.document();
      const documentVersion1: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: documentId,
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: { ...content, number: 1 },
        contentBlockingKeys: ["key:old"],
        referencedDocuments: [],
        contentSummary: contentSummary,
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(1),
      };
      const documentVersion2: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: documentId,
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: { ...content, number: 2 },
        contentBlockingKeys: ["key:new"],
        referencedDocuments: [],
        contentSummary: contentSummary,
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

      // Exercise - search for old version's blocking key
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.documentVersion.findAnyLatestWhereCollectionIdEqAndContentBlockingKeysOverlap(
              collectionId,
              ["key:old"],
            ),
        }),
      );

      // Verify - should not find old version
      expect(found).toEqual(null);
    });

    it("case: multiple documents with same blocking key => returns any one", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const collectionId = Id.generate.collection();
      const sharedKey = "key:shared";

      const documentVersion1: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: Id.generate.document(),
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentBlockingKeys: [sharedKey, "key:unique1"],
        referencedDocuments: [],
        contentSummary: contentSummary,
        previousVersionId: null,
        createdBy: DocumentVersionCreator.User,
        createdAt: new Date(),
      };
      const documentVersion2: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: Id.generate.document(),
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentBlockingKeys: [sharedKey, "key:unique2"],
        referencedDocuments: [],
        contentSummary: contentSummary,
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
            await repos.documentVersion.findAnyLatestWhereCollectionIdEqAndContentBlockingKeysOverlap(
              collectionId,
              [sharedKey],
            ),
        }),
      );

      // Verify
      assert.isNotNull(found);
      expect(found.collectionId).toEqual(collectionId);
      expect([documentVersion1.id, documentVersion2.id]).toContain(found.id);
    });

    it("case: document version with null blocking keys => never returns it", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const collectionId = Id.generate.collection();
      const documentVersion: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: Id.generate.document(),
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
            await repos.documentVersion.findAnyLatestWhereCollectionIdEqAndContentBlockingKeysOverlap(
              collectionId,
              ["key:1"],
            ),
        }),
      );

      // Verify
      expect(found).toEqual(null);
    });

    it("case: empty blocking keys array in query => returns null", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const collectionId = Id.generate.collection();
      const documentVersion: DocumentVersionEntity = {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionId: collectionId,
        documentId: Id.generate.document(),
        collectionVersionId: Id.generate.collectionVersion(),
        conversationId: null,
        content: content,
        contentBlockingKeys: ["key:1", "key:2"],
        referencedDocuments: [],
        contentSummary: contentSummary,
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

      // Exercise - searching with empty array should return null
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.documentVersion.findAnyLatestWhereCollectionIdEqAndContentBlockingKeysOverlap(
              collectionId,
              [],
            ),
        }),
      );

      // Verify
      expect(found).toEqual(null);
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
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
        contentBlockingKeys: null,
        referencedDocuments: [],
        contentSummary: contentSummary,
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
});

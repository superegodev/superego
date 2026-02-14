import {
  ConnectorAuthenticationStrategy,
  DocumentVersionCreator,
} from "@superego/backend";
import type { Connector } from "@superego/executing-backend";
import { DataType, type Schema } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";
import triggerAndWaitForDownSync from "../utils/triggerAndWaitForDownSync.js";

export default rd<GetDependencies>("Documents", (deps) => {
  describe("create", () => {
    it("error: CollectionNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const collectionId = Id.generate.collection();
      const result = await backend.documents.create({
        collectionId: collectionId,
        content: {},
      });

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionNotFound",
          details: { collectionId },
        },
      });
    });

    it("error: ConnectorDoesNotSupportUpSyncing", async () => {
      // Setup mocks
      const mockConnector: Connector.OAuth2PKCE<Schema> = {
        name: "MockConnector",
        authenticationStrategy: ConnectorAuthenticationStrategy.OAuth2PKCE,
        settingsSchema: null,
        remoteDocumentTypescriptSchema: {
          types: "export type RemoteDocument = {};",
          rootType: "RemoteDocument",
        },
        getAuthorizationRequestUrl: async () => "authorizationRequestUrl",
        getAuthenticationState: async () => ({
          success: true,
          data: {
            accessToken: "accessToken",
            refreshToken: "refreshToken",
            accessTokenExpiresAt: new Date(),
          },
          error: null,
        }),
        syncDown: async ({ authenticationState }) => ({
          success: true,
          data: {
            changes: { addedOrModified: [], deleted: [] },
            authenticationState,
            syncPoint: "syncPoint",
          },
          error: null,
        }),
      };

      // Setup SUT
      const { backend } = deps(mockConnector);
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                title: { dataType: DataType.String },
              },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      const setRemoteResult = await backend.collections.setRemote(
        createCollectionResult.data.id,
        mockConnector.name,
        { clientId: "clientId", clientSecret: "clientSecret" },
        null,
        {
          fromRemoteDocument: {
            source: "",
            compiled:
              "export default function fromRemoteDocument(remote) { return { title: remote.title }; }",
          },
        },
      );
      assert.isTrue(setRemoteResult.success);

      // Exercise
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "title" },
      });

      // Verify
      expect(createDocumentResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "ConnectorDoesNotSupportUpSyncing",
          details: {
            collectionId: createCollectionResult.data.id,
            connectorName: mockConnector.name,
            message:
              "The collection has a remote, and its connector does not support up-syncing. This effectively makes the collection read-only.",
          },
        },
      });
    });

    it("error: DocumentContentNotValid", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: 123 },
      });

      // Verify
      expect(createDocumentResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "DocumentContentNotValid",
          details: {
            collectionId: createCollectionResult.data.id,
            collectionVersionId: createCollectionResult.data.latestVersion.id,
            documentId: null,
            issues: [
              {
                message: "Invalid type: Expected string but received 123",
                path: [{ key: "title" }],
              },
            ],
          },
        },
      });
    });

    it("error: FilesNotFound", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { attachment: { dataType: DataType.File } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const fileId = Id.generate.file();
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: {
          attachment: {
            id: fileId,
            name: "file.txt",
            mimeType: "text/plain",
          },
        },
      });

      // Verify
      expect(createDocumentResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "FilesNotFound",
          details: { fileIds: [fileId] },
        },
      });
    });

    it("error: ReferencedDocumentsNotFound", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                documentRef: { dataType: DataType.DocumentRef },
              },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const nonExistentDocumentId = Id.generate.document();
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: {
          documentRef: {
            collectionId: createCollectionResult.data.id,
            documentId: nonExistentDocumentId,
          },
        },
      });

      // Verify
      expect(createDocumentResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "ReferencedDocumentsNotFound",
          details: {
            collectionId: createCollectionResult.data.id,
            documentId: null,
            notFoundDocumentRefs: [
              {
                collectionId: createCollectionResult.data.id,
                documentId: nonExistentDocumentId,
              },
            ],
          },
        },
      });
    });

    it("error: MakingContentBlockingKeysFailed", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: {
            source: "",
            compiled:
              "export default function getContentBlockingKeys() { return 123; }",
          },
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "title" },
      });

      // Verify
      expect(createDocumentResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "MakingContentBlockingKeysFailed",
          details: {
            collectionId: createCollectionResult.data.id,
            collectionVersionId: createCollectionResult.data.latestVersion.id,
            documentId: null,
            cause: {
              name: "ContentBlockingKeysNotValid",
              details: { contentBlockingKeys: 123 },
            },
          },
        },
      });
    });

    it("error: DuplicateDocumentDetected", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: {
            source: "",
            compiled:
              // biome-ignore lint/suspicious/noTemplateCurlyInString: intended.
              "export default function getContentBlockingKeys(content) { return [`title:${content.title}`]; }",
          },
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "title" },
      });
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const createDuplicateDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "title" },
      });

      // Verify
      expect(createDuplicateDocumentResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "DuplicateDocumentDetected",
          details: {
            collectionId: createCollectionResult.data.id,
            duplicateDocument: createDocumentResult.data,
          },
        },
      });
    });

    it("success: creates when duplicate exists but skipDuplicateCheck is true", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: {
            source: "",
            compiled:
              // biome-ignore lint/suspicious/noTemplateCurlyInString: intended.
              "export default function getContentBlockingKeys(content) { return [`title:${content.title}`]; }",
          },
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "title" },
      });
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const content = { title: "title" };
      const createDuplicateDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content,
        options: { skipDuplicateCheck: true },
      });

      // Verify
      assert.isTrue(createDuplicateDocumentResult.success);
      expect(createDuplicateDocumentResult.data).toEqual({
        id: expect.id("Document"),
        remoteId: null,
        remoteUrl: null,
        collectionId: createCollectionResult.data.id,
        latestVersion: expect.objectContaining({
          id: expect.id("DocumentVersion"),
          remoteId: null,
          previousVersionId: null,
          collectionVersionId: createCollectionResult.data.latestVersion.id,
          conversationId: null,
          content,
          createdBy: DocumentVersionCreator.User,
          createdAt: expect.dateCloseToNow(),
        }),
        createdAt: expect.dateCloseToNow(),
      });
      // Verify both documents exist.
      const listDocumentsResult = await backend.documents.list(
        createCollectionResult.data.id,
      );
      assert.isTrue(listDocumentsResult.success);
      expect(listDocumentsResult.data).toHaveLength(2);
    });

    it("success: creates", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const content = { title: "title" };
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: content,
      });

      // Verify
      assert.isTrue(createDocumentResult.success);
      expect(createDocumentResult.data).toEqual({
        id: expect.id("Document"),
        remoteId: null,
        remoteUrl: null,
        collectionId: createCollectionResult.data.id,
        latestVersion: expect.objectContaining({
          id: expect.id("DocumentVersion"),
          remoteId: null,
          previousVersionId: null,
          collectionVersionId: createCollectionResult.data.latestVersion.id,
          conversationId: null,
          content,
          createdBy: DocumentVersionCreator.User,
          createdAt: expect.dateCloseToNow(),
        }),
        createdAt: expect.dateCloseToNow(),
      });
      const getDocumentResult = await backend.documents.get(
        createCollectionResult.data.id,
        createDocumentResult.data.id,
      );
      expect(getDocumentResult).toEqual({
        success: true,
        data: createDocumentResult.data,
        error: null,
      });
    });
  });

  describe("createMany", () => {
    it("error: CollectionNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const collectionId = Id.generate.collection();
      const result = await backend.documents.createMany([
        { collectionId, content: { title: "title" } },
      ]);

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionNotFound",
          details: { collectionId },
        },
      });
    });

    it("error: DocumentContentNotValid", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const result = await backend.documents.createMany([
        {
          collectionId: createCollectionResult.data.id,
          content: { title: 123 },
        },
      ]);

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "DocumentContentNotValid",
          details: {
            collectionId: createCollectionResult.data.id,
            collectionVersionId: createCollectionResult.data.latestVersion.id,
            documentId: null,
            issues: [
              {
                message: "Invalid type: Expected string but received 123",
                path: [{ key: "title" }],
              },
            ],
          },
        },
      });
    });

    it("error: ReferencedDocumentsNotFound (non-existent document)", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                title: { dataType: DataType.String },
                relatedDoc: { dataType: DataType.DocumentRef },
              },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const nonExistentDocumentId = Id.generate.document();
      const result = await backend.documents.createMany([
        {
          collectionId: createCollectionResult.data.id,
          content: {
            title: "title",
            relatedDoc: {
              collectionId: createCollectionResult.data.id,
              documentId: nonExistentDocumentId,
            },
          },
        },
      ]);

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "ReferencedDocumentsNotFound",
          details: {
            collectionId: createCollectionResult.data.id,
            documentId: null,
            notFoundDocumentRefs: [
              {
                collectionId: createCollectionResult.data.id,
                documentId: nonExistentDocumentId,
              },
            ],
          },
        },
      });
    });

    it("error: ReferencedDocumentsNotFound (invalid proto document id)", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                title: { dataType: DataType.String },
                relatedDoc: { dataType: DataType.DocumentRef },
              },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Exercise
      // Reference a proto document that doesn't exist in the batch
      const invalidProtoId = Id.generate.protoDocument(99);
      const result = await backend.documents.createMany([
        {
          collectionId: createCollectionResult.data.id,
          content: {
            title: "title",
            relatedDoc: {
              collectionId: createCollectionResult.data.id,
              documentId: invalidProtoId,
            },
          },
        },
      ]);

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "ReferencedDocumentsNotFound",
          details: {
            collectionId: createCollectionResult.data.id,
            documentId: null,
            notFoundDocumentRefs: [
              {
                collectionId: createCollectionResult.data.id,
                documentId: invalidProtoId,
              },
            ],
          },
        },
      });
    });

    it("success: creates single document", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const content = { title: "title" };
      const result = await backend.documents.createMany([
        { collectionId: createCollectionResult.data.id, content },
      ]);

      // Verify
      assert.isTrue(result.success);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual({
        id: expect.id("Document"),
        remoteId: null,
        remoteUrl: null,
        collectionId: createCollectionResult.data.id,
        latestVersion: expect.objectContaining({
          id: expect.id("DocumentVersion"),
          remoteId: null,
          previousVersionId: null,
          collectionVersionId: createCollectionResult.data.latestVersion.id,
          conversationId: null,
          content,
          createdBy: DocumentVersionCreator.User,
          createdAt: expect.dateCloseToNow(),
        }),
        createdAt: expect.dateCloseToNow(),
      });
      const listResult = await backend.documents.list(
        createCollectionResult.data.id,
      );
      expect(listResult).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ id: result.data![0]!.id }),
        ]),
        error: null,
      });
    });

    it("success: creates multiple independent documents", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const result = await backend.documents.createMany([
        {
          collectionId: createCollectionResult.data.id,
          content: { title: "document-1" },
        },
        {
          collectionId: createCollectionResult.data.id,
          content: { title: "document-2" },
        },
      ]);

      // Verify
      assert.isTrue(result.success);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]!.latestVersion.content).toEqual({
        title: "document-1",
      });
      expect(result.data[1]!.latestVersion.content).toEqual({
        title: "document-2",
      });
      const listResult = await backend.documents.list(
        createCollectionResult.data.id,
      );
      assert.isTrue(listResult.success);
      expect(listResult.data).toHaveLength(2);
    });

    it("success: creates documents with cross-references using proto document IDs", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                title: { dataType: DataType.String },
                relatedDoc: { dataType: DataType.DocumentRef },
              },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Exercise
      // Document 0 references Document 1, and Document 1 references Document 0
      const protoDocument0 = Id.generate.protoDocument(0);
      const protoDocument1 = Id.generate.protoDocument(1);
      const result = await backend.documents.createMany([
        {
          collectionId: createCollectionResult.data.id,
          content: {
            title: "document-0",
            relatedDoc: {
              collectionId: createCollectionResult.data.id,
              documentId: protoDocument1,
            },
          },
        },
        {
          collectionId: createCollectionResult.data.id,
          content: {
            title: "document-1",
            relatedDoc: {
              collectionId: createCollectionResult.data.id,
              documentId: protoDocument0,
            },
          },
        },
      ]);

      // Verify
      assert.isTrue(result.success);
      assert.isNotNull(result.data);
      expect(result.data).toHaveLength(2);

      const document0 = result.data[0];
      const document1 = result.data[1];
      assert.isDefined(document0);
      assert.isDefined(document1);

      // Verify the proto document IDs were replaced with actual IDs
      // Document 0 should reference Document 1
      expect(document0.latestVersion.content).toEqual({
        title: "document-0",
        relatedDoc: {
          collectionId: createCollectionResult.data.id,
          documentId: document1.id,
        },
      });

      // Document 1 should reference Document 0
      expect(document1.latestVersion.content).toEqual({
        title: "document-1",
        relatedDoc: {
          collectionId: createCollectionResult.data.id,
          documentId: document0.id,
        },
      });
    });

    it("atomicity: no documents created if one fails validation", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const result = await backend.documents.createMany([
        {
          collectionId: createCollectionResult.data.id,
          content: { title: "valid-document" },
        },
        {
          collectionId: createCollectionResult.data.id,
          // Invalid: number instead of string.
          content: { title: 123 },
        },
      ]);

      // Verify: operation should fail, no documents should exist (atomicity)
      expect(result.success).toBe(false);
      expect(result.error?.name).toBe("DocumentContentNotValid");
      const listResult = await backend.documents.list(
        createCollectionResult.data.id,
      );
      assert.isTrue(listResult.success);
      expect(listResult.data).toHaveLength(0);
    });
  });

  describe("createNewVersion", () => {
    it("error: CollectionNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const collectionId = Id.generate.collection();
      const documentId = Id.generate.document();
      const latestVersionId = Id.generate.documentVersion();
      const createNewDocumentVersionResult =
        await backend.documents.createNewVersion(
          collectionId,
          documentId,
          latestVersionId,
          { title: "updated" },
        );

      // Verify
      expect(createNewDocumentVersionResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionNotFound",
          details: { collectionId },
        },
      });
    });

    it("error: DocumentNotFound", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const documentId = Id.generate.document();
      const latestVersionId = Id.generate.documentVersion();
      const createNewDocumentVersionResult =
        await backend.documents.createNewVersion(
          createCollectionResult.data.id,
          documentId,
          latestVersionId,
          { title: "updated" },
        );

      // Verify
      expect(createNewDocumentVersionResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "DocumentNotFound",
          details: { documentId },
        },
      });
    });

    it("error: ConnectorDoesNotSupportUpSyncing", async () => {
      // Setup mocks
      const changes: Connector.Changes = {
        addedOrModified: [
          {
            id: "remoteId",
            versionId: "remoteVersionId",
            url: "remoteUrl",
            content: { title: "remote title" },
          },
        ],
        deleted: [],
      };
      const mockConnector: Connector.OAuth2PKCE<Schema> = {
        name: "MockConnector",
        authenticationStrategy: ConnectorAuthenticationStrategy.OAuth2PKCE,
        settingsSchema: {
          types: { Settings: { dataType: DataType.Struct, properties: {} } },
          rootType: "Settings",
        },
        remoteDocumentTypescriptSchema: {
          types: "export type RemoteDocument = { title: string };",
          rootType: "RemoteDocument",
        },
        getAuthorizationRequestUrl: async () => "authorizationRequestUrl",
        getAuthenticationState: async () => ({
          success: true,
          data: {
            accessToken: "accessToken",
            refreshToken: "refreshToken",
            accessTokenExpiresAt: new Date(),
          },
          error: null,
        }),
        syncDown: async ({ authenticationState }) => ({
          success: true,
          data: { changes, authenticationState, syncPoint: "syncPoint" },
          error: null,
        }),
      };

      // Setup SUT
      const { backend } = deps(mockConnector);
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      const setRemoteResult = await backend.collections.setRemote(
        createCollectionResult.data.id,
        mockConnector.name,
        { clientId: "clientId", clientSecret: "clientSecret" },
        {},
        {
          fromRemoteDocument: {
            source: "",
            compiled:
              "export default function fromRemoteDocument(remote) { return { title: remote.title }; }",
          },
        },
      );
      assert.isTrue(setRemoteResult.success);
      const authenticateOAuth2PKCEConnectorResult =
        await backend.collections.authenticateOAuth2PKCEConnector(
          createCollectionResult.data.id,
          "authorizationResponseUrl",
        );
      assert.isTrue(authenticateOAuth2PKCEConnectorResult.success);
      await triggerAndWaitForDownSync(backend, createCollectionResult.data.id);
      const listDocumentsResult = await backend.documents.list(
        createCollectionResult.data.id,
      );
      assert.isTrue(listDocumentsResult.success);
      const remoteDocument = listDocumentsResult.data[0];
      assert.isDefined(remoteDocument);

      // Exercise
      const createNewDocumentVersionResult =
        await backend.documents.createNewVersion(
          createCollectionResult.data.id,
          remoteDocument.id,
          remoteDocument.latestVersion.id,
          { title: "updated" },
        );

      // Verify
      expect(createNewDocumentVersionResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "ConnectorDoesNotSupportUpSyncing",
          details: {
            collectionId: createCollectionResult.data.id,
            connectorName: mockConnector.name,
            message:
              "The collection has a remote, and its connector does not support up-syncing. This effectively makes the collection read-only.",
          },
        },
      });
    });

    it("error: DocumentVersionIdNotMatching", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "title" },
      });
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const wrongVersionId = Id.generate.documentVersion();
      const createNewDocumentVersionResult =
        await backend.documents.createNewVersion(
          createCollectionResult.data.id,
          createDocumentResult.data.id,
          wrongVersionId,
          { title: "updated title" },
        );

      // Verify
      expect(createNewDocumentVersionResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "DocumentVersionIdNotMatching",
          details: {
            documentId: createDocumentResult.data.id,
            latestVersionId: createDocumentResult.data.latestVersion.id,
            suppliedVersionId: wrongVersionId,
          },
        },
      });
    });

    it("error: DocumentContentNotValid", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "title" },
      });
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const createNewDocumentVersionResult =
        await backend.documents.createNewVersion(
          createCollectionResult.data.id,
          createDocumentResult.data.id,
          createDocumentResult.data.latestVersion.id,
          { title: 123 },
        );

      // Verify
      expect(createNewDocumentVersionResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "DocumentContentNotValid",
          details: {
            collectionId: createCollectionResult.data.id,
            collectionVersionId: createCollectionResult.data.latestVersion.id,
            documentId: createDocumentResult.data.id,
            issues: [
              {
                message: "Invalid type: Expected string but received 123",
                path: [{ key: "title" }],
              },
            ],
          },
        },
      });
    });

    it("error: FilesNotFound", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { attachment: { dataType: DataType.File } },
              nullableProperties: ["attachment"],
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { attachment: null },
      });
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const fileId = Id.generate.file();
      const createNewDocumentVersionResult =
        await backend.documents.createNewVersion(
          createCollectionResult.data.id,
          createDocumentResult.data.id,
          createDocumentResult.data.latestVersion.id,
          {
            attachment: {
              id: fileId,
              name: "file.txt",
              mimeType: "text/plain",
            },
          },
        );

      // Verify
      expect(createNewDocumentVersionResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "FilesNotFound",
          details: { fileIds: [fileId] },
        },
      });
    });

    it("error: ReferencedDocumentsNotFound", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                documentRef: { dataType: DataType.DocumentRef },
              },
              nullableProperties: ["documentRef"],
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { documentRef: null },
      });
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const nonExistentDocumentId = Id.generate.document();
      const createNewVersionResult = await backend.documents.createNewVersion(
        createCollectionResult.data.id,
        createDocumentResult.data.id,
        createDocumentResult.data.latestVersion.id,
        {
          documentRef: {
            collectionId: createCollectionResult.data.id,
            documentId: nonExistentDocumentId,
          },
        },
      );

      // Verify
      expect(createNewVersionResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "ReferencedDocumentsNotFound",
          details: {
            collectionId: createCollectionResult.data.id,
            documentId: createDocumentResult.data.id,
            notFoundDocumentRefs: [
              {
                collectionId: createCollectionResult.data.id,
                documentId: nonExistentDocumentId,
              },
            ],
          },
        },
      });
    });

    it("error: MakingContentBlockingKeysFailed", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: {
            source: "",
            compiled: `
              export default function getContentBlockingKeys(content) {
                return content.title === "title" ? ["title:title"] : 123;
              }
            `,
          },
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "title" },
        options: { skipDuplicateCheck: true },
      });
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const createNewDocumentVersionResult =
        await backend.documents.createNewVersion(
          createCollectionResult.data.id,
          createDocumentResult.data.id,
          createDocumentResult.data.latestVersion.id,
          { title: "updated title" },
        );

      // Verify
      expect(createNewDocumentVersionResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "MakingContentBlockingKeysFailed",
          details: {
            collectionId: createCollectionResult.data.id,
            collectionVersionId: createCollectionResult.data.latestVersion.id,
            documentId: createDocumentResult.data.id,
            cause: {
              name: "ContentBlockingKeysNotValid",
              details: { contentBlockingKeys: 123 },
            },
          },
        },
      });
    });

    it("success: creates new version", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                title: { dataType: DataType.String },
              },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "title" },
      });
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const createNewDocumentVersionResult =
        await backend.documents.createNewVersion(
          createCollectionResult.data.id,
          createDocumentResult.data.id,
          createDocumentResult.data.latestVersion.id,
          { title: "updated title" },
        );

      // Verify
      assert.isTrue(createNewDocumentVersionResult.success);
      expect(createNewDocumentVersionResult.data).toEqual({
        ...createDocumentResult.data,
        latestVersion: expect.objectContaining({
          id: expect.id("DocumentVersion"),
          previousVersionId: createDocumentResult.data.latestVersion.id,
          collectionVersionId: createCollectionResult.data.latestVersion.id,
          content: { title: "updated title" },
          createdBy: DocumentVersionCreator.User,
          createdAt: expect.dateCloseToNow(),
        }),
      });
      const getDocumentVersionResult = await backend.documents.getVersion(
        createCollectionResult.data.id,
        createDocumentResult.data.id,
        createNewDocumentVersionResult.data.latestVersion.id,
      );
      expect(getDocumentVersionResult).toEqual({
        success: true,
        data: createNewDocumentVersionResult.data.latestVersion,
        error: null,
      });
    });
  });

  describe("delete", () => {
    it("error: CollectionNotFound", async () => {
      // Setup SUT
      const { backend } = deps();
      const collectionId = Id.generate.collection();

      // Exercise
      const documentId = Id.generate.document();
      const result = await backend.documents.delete(
        collectionId,
        documentId,
        "delete",
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionNotFound",
          details: { collectionId },
        },
      });
    });

    it("error: DocumentNotFound", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                title: { dataType: DataType.String },
              },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const documentId = Id.generate.document();
      const result = await backend.documents.delete(
        createCollectionResult.data.id,
        documentId,
        "delete",
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "DocumentNotFound",
          details: { documentId },
        },
      });
    });

    it("error: CommandConfirmationNotValid", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                title: { dataType: DataType.String },
              },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "title" },
      });
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const deleteDocumentResult = await backend.documents.delete(
        createCollectionResult.data.id,
        createDocumentResult.data.id,
        "not-delete",
      );

      // Verify
      expect(deleteDocumentResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CommandConfirmationNotValid",
          details: {
            requiredCommandConfirmation: "delete",
            suppliedCommandConfirmation: "not-delete",
          },
        },
      });
    });

    it("error: ConnectorDoesNotSupportUpSyncing", async () => {
      // Setup mocks
      const changes: Connector.Changes = {
        addedOrModified: [
          {
            id: "remoteId",
            versionId: "remoteVersionId",
            url: "remoteUrl",
            content: { title: "remote title" },
          },
        ],
        deleted: [],
      };
      const mockConnector: Connector.OAuth2PKCE<Schema> = {
        name: "MockConnector",
        authenticationStrategy: ConnectorAuthenticationStrategy.OAuth2PKCE,
        settingsSchema: {
          types: { Settings: { dataType: DataType.Struct, properties: {} } },
          rootType: "Settings",
        },
        remoteDocumentTypescriptSchema: {
          types: "export type RemoteDocument = { title: string };",
          rootType: "RemoteDocument",
        },
        getAuthorizationRequestUrl: async () => "authorizationRequestUrl",
        getAuthenticationState: async () => ({
          success: true,
          data: {
            accessToken: "accessToken",
            refreshToken: "refreshToken",
            accessTokenExpiresAt: new Date(),
          },
          error: null,
        }),
        syncDown: async ({ authenticationState }) => ({
          success: true,
          data: { changes, authenticationState, syncPoint: "syncPoint" },
          error: null,
        }),
      };

      // Setup SUT
      const { backend } = deps(mockConnector);
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                title: { dataType: DataType.String },
              },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      const setRemoteResult = await backend.collections.setRemote(
        createCollectionResult.data.id,
        mockConnector.name,
        { clientId: "clientId", clientSecret: "clientSecret" },
        {},
        {
          fromRemoteDocument: {
            source: "",
            compiled:
              "export default function fromRemoteDocument(remote) { return { title: remote.title }; }",
          },
        },
      );
      assert.isTrue(setRemoteResult.success);
      const authenticateOAuth2PKCEConnectorResult =
        await backend.collections.authenticateOAuth2PKCEConnector(
          createCollectionResult.data.id,
          "authorizationResponseUrl",
        );
      assert.isTrue(authenticateOAuth2PKCEConnectorResult.success);
      await triggerAndWaitForDownSync(backend, createCollectionResult.data.id);
      const listDocumentsResult = await backend.documents.list(
        createCollectionResult.data.id,
      );
      assert.isTrue(listDocumentsResult.success);
      const remoteDocument = listDocumentsResult.data[0];
      assert.isDefined(remoteDocument);

      // Exercise
      const deleteDocumentResult = await backend.documents.delete(
        createCollectionResult.data.id,
        remoteDocument.id,
        "delete",
      );

      // Verify
      expect(deleteDocumentResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "ConnectorDoesNotSupportUpSyncing",
          details: {
            collectionId: createCollectionResult.data.id,
            connectorName: mockConnector.name,
            message:
              "The collection has a remote, and its connector does not support up-syncing. This effectively makes the collection read-only.",
          },
        },
      });
    });

    it("error: DocumentIsReferenced", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                title: { dataType: DataType.String },
                documentRef: { dataType: DataType.DocumentRef },
              },
              nullableProperties: ["documentRef"],
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      // Create document A (will be referenced)
      const createDocumentAResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "Document A", documentRef: null },
      });
      assert.isTrue(createDocumentAResult.success);
      // Create document B that references document A
      const createDocumentBResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: {
          title: "Document B",
          documentRef: {
            collectionId: createCollectionResult.data.id,
            documentId: createDocumentAResult.data.id,
          },
        },
      });
      assert.isTrue(createDocumentBResult.success);

      // Exercise - try to delete document A which is referenced by B
      const deleteResult = await backend.documents.delete(
        createCollectionResult.data.id,
        createDocumentAResult.data.id,
        "delete",
      );

      // Verify
      expect(deleteResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "DocumentIsReferenced",
          details: {
            collectionId: createCollectionResult.data.id,
            documentId: createDocumentAResult.data.id,
            referencingDocuments: [
              {
                collectionId: createCollectionResult.data.id,
                documentId: createDocumentBResult.data.id,
              },
            ],
          },
        },
      });
    });

    it("success: deletes", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                title: { dataType: DataType.String },
              },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "title" },
      });
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const deleteDocumentResult = await backend.documents.delete(
        createCollectionResult.data.id,
        createDocumentResult.data.id,
        "delete",
      );

      // Verify
      expect(deleteDocumentResult).toEqual({
        success: true,
        data: null,
        error: null,
      });
      const listResult = await backend.documents.list(
        createCollectionResult.data.id,
      );
      expect(listResult).toEqual({ success: true, data: [], error: null });
    });
  });

  describe("list", () => {
    it("error: CollectionNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const collectionId = Id.generate.collection();
      const result = await backend.documents.list(collectionId);

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionNotFound",
          details: { collectionId },
        },
      });
    });

    it("success: lists lite documents", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "first" },
      });
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const listDocumentsResult = await backend.documents.list(
        createCollectionResult.data.id,
      );

      // Verify
      assert.isTrue(listDocumentsResult.success);
      const document = listDocumentsResult.data.find(
        ({ id }) => id === createDocumentResult.data.id,
      );
      assert.isDefined(document);
      expect(document.latestVersion).not.toHaveProperty("content");
      expect(document).toEqual(
        expect.objectContaining({
          id: createDocumentResult.data.id,
          collectionId: createCollectionResult.data.id,
        }),
      );
    });
  });

  describe("listVersions", () => {
    it("error: DocumentNotFound", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const documentId = Id.generate.document();
      const listVersionsResult = await backend.documents.listVersions(
        createCollectionResult.data.id,
        documentId,
      );

      // Verify
      expect(listVersionsResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "DocumentNotFound",
          details: { documentId },
        },
      });
    });

    it("success: lists minimal versions (case: document with single version)", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "title" },
      });
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const listVersionsResult = await backend.documents.listVersions(
        createCollectionResult.data.id,
        createDocumentResult.data.id,
      );

      // Verify
      assert.isTrue(listVersionsResult.success);
      expect(listVersionsResult.data).toHaveLength(1);
      expect(listVersionsResult.data[0]).toEqual(
        expect.objectContaining({
          id: createDocumentResult.data.latestVersion.id,
          previousVersionId: null,
          collectionVersionId: createCollectionResult.data.latestVersion.id,
          createdBy: DocumentVersionCreator.User,
        }),
      );
      // Should be minimal version (no content or contentSummary)
      expect(listVersionsResult.data[0]).not.toHaveProperty("content");
      expect(listVersionsResult.data[0]).not.toHaveProperty("contentSummary");
    });

    it("success: lists minimal versions (case: document with multiple versions)", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "version 1" },
      });
      assert.isTrue(createDocumentResult.success);
      const createNewVersionResult1 = await backend.documents.createNewVersion(
        createCollectionResult.data.id,
        createDocumentResult.data.id,
        createDocumentResult.data.latestVersion.id,
        { title: "version 2" },
      );
      assert.isTrue(createNewVersionResult1.success);
      const createNewVersionResult2 = await backend.documents.createNewVersion(
        createCollectionResult.data.id,
        createDocumentResult.data.id,
        createNewVersionResult1.data.latestVersion.id,
        { title: "version 3" },
      );
      assert.isTrue(createNewVersionResult2.success);

      // Exercise
      const listVersionsResult = await backend.documents.listVersions(
        createCollectionResult.data.id,
        createDocumentResult.data.id,
      );

      // Verify
      assert.isTrue(listVersionsResult.success);
      expect(listVersionsResult.data).toHaveLength(3);
      // Should contain all version IDs
      const versionIds = listVersionsResult.data.map((v) => v.id);
      expect(versionIds).toContain(createDocumentResult.data.latestVersion.id);
      expect(versionIds).toContain(
        createNewVersionResult1.data.latestVersion.id,
      );
      expect(versionIds).toContain(
        createNewVersionResult2.data.latestVersion.id,
      );
      // Verify the previousVersionId chain is correct
      const documentVersion1 = listVersionsResult.data.find(
        ({ id }) => id === createDocumentResult.data.latestVersion.id,
      );
      const documentVersion2 = listVersionsResult.data.find(
        ({ id }) => id === createNewVersionResult1.data.latestVersion.id,
      );
      const documentVersion3 = listVersionsResult.data.find(
        ({ id }) => id === createNewVersionResult2.data.latestVersion.id,
      );
      expect(documentVersion1!.previousVersionId).toEqual(null);
      expect(documentVersion2!.previousVersionId).toEqual(
        createDocumentResult.data.latestVersion.id,
      );
      expect(documentVersion3!.previousVersionId).toEqual(
        createNewVersionResult1.data.latestVersion.id,
      );
    });

    it("success: does not return versions from other documents", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocument1Result = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "document 1" },
      });
      assert.isTrue(createDocument1Result.success);
      const createDocument2Result = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "document 2" },
      });
      assert.isTrue(createDocument2Result.success);
      const createNewVersionResult = await backend.documents.createNewVersion(
        createCollectionResult.data.id,
        createDocument2Result.data.id,
        createDocument2Result.data.latestVersion.id,
        { title: "document 2 updated" },
      );
      assert.isTrue(createNewVersionResult.success);

      // Exercise
      const listVersionsResult = await backend.documents.listVersions(
        createCollectionResult.data.id,
        createDocument1Result.data.id,
      );

      // Verify
      assert.isTrue(listVersionsResult.success);
      expect(listVersionsResult.data).toHaveLength(1);
      expect(listVersionsResult.data[0]!.id).toEqual(
        createDocument1Result.data.latestVersion.id,
      );
    });
  });

  describe("get", () => {
    it("error: DocumentNotFound", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const documentId = Id.generate.document();
      const getDocumentResult = await backend.documents.get(
        createCollectionResult.data.id,
        documentId,
      );

      // Verify
      expect(getDocumentResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "DocumentNotFound",
          details: { documentId },
        },
      });
    });

    it("success: gets", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                title: { dataType: DataType.String },
              },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "title" },
      });
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const getDocumentResult = await backend.documents.get(
        createCollectionResult.data.id,
        createDocumentResult.data.id,
      );

      // Verify
      expect(getDocumentResult).toEqual({
        success: true,
        data: createDocumentResult.data,
        error: null,
      });
    });
  });

  describe("getVersion", () => {
    it("error: DocumentVersionNotFound", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const documentId = Id.generate.document();
      const documentVersionId = Id.generate.documentVersion();
      const getDocumentVersionResult = await backend.documents.getVersion(
        createCollectionResult.data.id,
        documentId,
        documentVersionId,
      );

      // Verify
      expect(getDocumentVersionResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "DocumentVersionNotFound",
          details: {
            collectionId: createCollectionResult.data.id,
            documentId,
            documentVersionId,
          },
        },
      });
    });

    it("success: gets version", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "title" },
      });
      assert.isTrue(createDocumentResult.success);
      const createNewDocumentVersionResult =
        await backend.documents.createNewVersion(
          createCollectionResult.data.id,
          createDocumentResult.data.id,
          createDocumentResult.data.latestVersion.id,
          { title: "updated title" },
        );
      assert.isTrue(createNewDocumentVersionResult.success);

      // Exercise
      const getDocumentVersionResult = await backend.documents.getVersion(
        createCollectionResult.data.id,
        createDocumentResult.data.id,
        createDocumentResult.data.latestVersion.id,
      );

      // Verify
      expect(getDocumentVersionResult).toEqual({
        success: true,
        data: createDocumentResult.data.latestVersion,
        error: null,
      });
    });
  });

  describe("search", () => {
    it("error: CollectionNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const collectionId = Id.generate.collection();
      const result = await backend.documents.search(collectionId, "query", {
        limit: 20,
      });

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionNotFound",
          details: { collectionId },
        },
      });
    });

    it("success: returns empty array when no matches", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "hello world" },
      });
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const searchResult = await backend.documents.search(
        createCollectionResult.data.id,
        "nonexistent",
        { limit: 20 },
      );

      // Verify
      expect(searchResult).toEqual({
        success: true,
        data: [],
        error: null,
      });
    });

    it("success: searches within a specific collection", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "hello world" },
      });
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const searchResult = await backend.documents.search(
        createCollectionResult.data.id,
        "hello",
        { limit: 20 },
      );

      // Verify
      assert.isTrue(searchResult.success);
      expect(searchResult.data).toHaveLength(1);
      expect(searchResult.data[0]).toEqual({
        match: expect.objectContaining({
          id: createDocumentResult.data.id,
          collectionId: createCollectionResult.data.id,
        }),
        matchedText: expect.any(String),
      });
      expect(searchResult.data[0]!.match.latestVersion).not.toHaveProperty(
        "content",
      );
    });

    it("success: searches across all collections when collectionId is null", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult1 = await backend.collections.create({
        settings: {
          name: "collection1",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult1.success);
      const createCollectionResult2 = await backend.collections.create({
        settings: {
          name: "collection2",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult2.success);
      const createDocumentResult1 = await backend.documents.create({
        collectionId: createCollectionResult1.data.id,
        content: { title: "unique keyword alpha" },
      });
      assert.isTrue(createDocumentResult1.success);
      const createDocumentResult2 = await backend.documents.create({
        collectionId: createCollectionResult2.data.id,
        content: { title: "unique keyword beta" },
      });
      assert.isTrue(createDocumentResult2.success);

      // Exercise
      const searchResult = await backend.documents.search(null, "unique", {
        limit: 20,
      });

      // Verify
      assert.isTrue(searchResult.success);
      expect(searchResult.data).toHaveLength(2);
      const resultIds = searchResult.data.map((result) => result.match.id);
      expect(resultIds).toContain(createDocumentResult1.data.id);
      expect(resultIds).toContain(createDocumentResult2.data.id);
    });

    it("success: does not return documents from other collections when collectionId is specified", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult1 = await backend.collections.create({
        settings: {
          name: "collection1",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult1.success);
      const createCollectionResult2 = await backend.collections.create({
        settings: {
          name: "collection2",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult2.success);
      const createDocumentResult1 = await backend.documents.create({
        collectionId: createCollectionResult1.data.id,
        content: { title: "searchterm in collection1" },
      });
      assert.isTrue(createDocumentResult1.success);
      const createDocumentResult2 = await backend.documents.create({
        collectionId: createCollectionResult2.data.id,
        content: { title: "searchterm in collection2" },
      });
      assert.isTrue(createDocumentResult2.success);

      // Exercise
      const searchResult = await backend.documents.search(
        createCollectionResult1.data.id,
        "searchterm",
        { limit: 20 },
      );

      // Verify
      assert.isTrue(searchResult.success);
      expect(searchResult.data).toHaveLength(1);
      expect(searchResult.data[0]!.match.id).toEqual(
        createDocumentResult1.data.id,
      );
    });
  });
});

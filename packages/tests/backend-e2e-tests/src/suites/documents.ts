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
      const result = await backend.documents.create(collectionId, {});

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
      const createCollectionResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
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
        {
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      );
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
      const createDocumentResult = await backend.documents.create(
        createCollectionResult.data.id,
        { title: "title" },
      );

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
      const createCollectionResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const createDocumentResult = await backend.documents.create(
        createCollectionResult.data.id,
        { title: 123 },
      );

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
      const createCollectionResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { attachment: { dataType: DataType.File } },
            },
          },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const fileId = Id.generate.file();
      const createDocumentResult = await backend.documents.create(
        createCollectionResult.data.id,
        {
          attachment: {
            id: fileId,
            name: "file.txt",
            mimeType: "text/plain",
          },
        },
      );

      // Verify
      expect(createDocumentResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "FilesNotFound",
          details: {
            collectionId: createCollectionResult.data.id,
            documentId: null,
            fileIds: [fileId],
          },
        },
      });
    });

    it("success: creates", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const content = { title: "title" };
      const createDocumentResult = await backend.documents.create(
        createCollectionResult.data.id,
        content,
      );

      // Verify
      assert.isTrue(createDocumentResult.success);
      expect(createDocumentResult.data).toEqual({
        id: expect.id("Document"),
        remoteId: null,
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
      const createCollectionResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create(
        createCollectionResult.data.id,
        { title: "first" },
      );
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

  describe("get", () => {
    it("error: DocumentNotFound", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      );
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
      const createCollectionResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
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
        {
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create(
        createCollectionResult.data.id,
        { title: "title" },
      );
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
      const createCollectionResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      );
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
      const createCollectionResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create(
        createCollectionResult.data.id,
        { title: "title" },
      );
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
      const createCollectionResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      );
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
            id: "remoteDocumentId",
            versionId: "remoteDocumentVersionId",
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
      const createCollectionResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      );
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
      const createCollectionResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create(
        createCollectionResult.data.id,
        { title: "title" },
      );
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
      const createCollectionResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create(
        createCollectionResult.data.id,
        { title: "title" },
      );
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
      const createCollectionResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { attachment: { dataType: DataType.File } },
              nullableProperties: ["attachment"],
            },
          },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create(
        createCollectionResult.data.id,
        { attachment: null },
      );
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
          details: {
            collectionId: createCollectionResult.data.id,
            documentId: createDocumentResult.data.id,
            fileIds: [fileId],
          },
        },
      });
    });

    it("success: creates new version", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
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
        {
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create(
        createCollectionResult.data.id,
        { title: "title" },
      );
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
      const createCollectionResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
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
        {
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      );
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
      const createCollectionResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
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
        {
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create(
        createCollectionResult.data.id,
        { title: "title" },
      );
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
            id: "remoteDocumentId",
            versionId: "remoteDocumentVersionId",
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
      const createCollectionResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
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
        {
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      );
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

    it("success: deletes", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
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
        {
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create(
        createCollectionResult.data.id,
        { title: "title" },
      );
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
});

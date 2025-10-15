import {
  ConnectorAuthenticationStrategy,
  DownSyncStatus,
} from "@superego/backend";
import type { Connector } from "@superego/executing-backend";
import { DataType, type Schema } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";
import triggerAndWaitForDownSync from "../utils/triggerAndWaitForDownSync.js";

export default rd<GetDependencies>("Collections", (deps) => {
  describe("create", () => {
    it("error: CollectionSettingsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.create(
        {
          name: "",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionSettingsNotValid",
          details: {
            collectionId: null,
            issues: [
              {
                message: "Invalid length: Expected >=1 but received 0",
                path: [{ key: "name" }],
              },
            ],
          },
        },
      });
    });

    it("error: CollectionCategoryNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const collectionCategoryId = Id.generate.collectionCategory();
      const result = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: collectionCategoryId,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionCategoryNotFound",
          details: { collectionCategoryId },
        },
      });
    });

    it("error: CollectionSchemaNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.String } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionSchemaNotValid",
          details: {
            collectionId: null,
            issues: [
              {
                message: "Root type must be a Struct",
                path: [{ key: "rootType" }],
              },
            ],
          },
        },
      });
    });

    it("error: ContentSummaryGetterNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export function getContentSummary() {}",
          },
        },
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "ContentSummaryGetterNotValid",
          details: {
            collectionId: null,
            collectionVersionId: null,
            issues: [
              {
                message:
                  "The default export of the contentSummaryGetter TypescriptModule is not a function",
              },
            ],
          },
        },
      });
    });

    it("success: creates", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );

      // Verify
      expect(createResult).toEqual({
        success: true,
        data: {
          id: expect.id("Collection"),
          latestVersion: {
            id: expect.id("CollectionVersion"),
            previousVersionId: null,
            schema: {
              types: { Root: { dataType: "Struct", properties: {} } },
              rootType: "Root",
            },
            settings: {
              contentSummaryGetter: {
                source: "",
                compiled: "export default function getContentSummary() {}",
              },
            },
            migration: null,
            remoteConverters: null,
            createdAt: expect.dateCloseToNow(),
          },
          settings: {
            name: "name",
            icon: null,
            collectionCategoryId: null,
            description: null,
            assistantInstructions: null,
          },
          remote: null,
          createdAt: expect.dateCloseToNow(),
        },
        error: null,
      });
      const listResult = await backend.collections.list();
      expect(listResult).toEqual({
        success: true,
        data: [createResult.data],
        error: null,
      });
    });
  });

  describe("updateSettings", () => {
    it("error: CollectionNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const collectionId = Id.generate.collection();
      const result = await backend.collections.updateSettings(collectionId, {
        name: "name",
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

    it("error: CollectionSettingsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);

      // Exercise
      const updateSettingsResult = await backend.collections.updateSettings(
        createResult.data.id,
        { name: "" },
      );

      // Verify
      expect(updateSettingsResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionSettingsNotValid",
          details: {
            collectionId: createResult.data.id,
            issues: [
              {
                message: "Invalid length: Expected >=1 but received 0",
                path: [{ key: "name" }],
              },
            ],
          },
        },
      });
    });

    it("error: CollectionCategoryNotFound", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);

      // Exercise
      const collectionCategoryId = Id.generate.collectionCategory();
      const updateSettingsResult = await backend.collections.updateSettings(
        createResult.data.id,
        { collectionCategoryId },
      );

      // Verify
      expect(updateSettingsResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionCategoryNotFound",
          details: { collectionCategoryId },
        },
      });
    });

    it("success: updates", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionCategoryResult =
        await backend.collectionCategories.create({
          name: "category",
          icon: null,
          parentId: null,
        });
      assert.isTrue(createCollectionCategoryResult.success);
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);

      // Exercise
      const updateResult = await backend.collections.updateSettings(
        createResult.data.id,
        {
          name: "updated-name",
          icon: "😃",
          collectionCategoryId: createCollectionCategoryResult.data.id,
          description: "updated description",
          assistantInstructions: "updated instructions",
        },
      );

      // Verify
      expect(updateResult).toEqual({
        success: true,
        data: {
          ...createResult.data,
          settings: {
            name: "updated-name",
            icon: "😃",
            collectionCategoryId: createCollectionCategoryResult.data.id,
            description: "updated description",
            assistantInstructions: "updated instructions",
          },
        },
        error: null,
      });
      const listResult = await backend.collections.list();
      expect(listResult).toEqual({
        success: true,
        data: [updateResult.data],
        error: null,
      });
    });
  });

  describe("setRemote", () => {
    it("error: CollectionNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const collectionId = Id.generate.collection();
      const result = await backend.collections.setRemote(
        collectionId,
        "Connector",
        { clientId: "clientId", clientSecret: "clientSecret" },
        {},
        {
          fromRemoteDocument: {
            source: "",
            compiled: "export default function fromRemoteDocument() {}",
          },
        },
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

    it("error: CollectionHasDocuments", async () => {
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
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create(
        createCollectionResult.data.id,
        {},
      );
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const setRemoteResult = await backend.collections.setRemote(
        createCollectionResult.data.id,
        mockConnector.name,
        {
          clientId: "clientId",
          clientSecret: "clientSecret",
        },
        null,
        {
          fromRemoteDocument: {
            source: "",
            compiled: "export default function fromRemoteDocument() {}",
          },
        },
      );

      // Verify
      expect(setRemoteResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionHasDocuments",
          details: {
            collectionId: createCollectionResult.data.id,
          },
        },
      });
    });

    it("error: ConnectorNotFound", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);

      // Exercise
      const connectorName = "MissingConnector";
      const setRemoteResult = await backend.collections.setRemote(
        createResult.data.id,
        connectorName,
        { clientId: "clientId", clientSecret: "clientSecret" },
        {},
        {
          fromRemoteDocument: {
            source: "",
            compiled: "export default function fromRemoteDocument() {}",
          },
        },
      );

      // Verify
      expect(setRemoteResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "ConnectorNotFound",
          details: {
            collectionId: createResult.data.id,
            connectorName: connectorName,
          },
        },
      });
    });

    it("error: CannotChangeCollectionRemoteConnector", async () => {
      // Setup mocks
      const mockConnector: Connector.OAuth2PKCE<Schema> = {
        name: "MockConnector",
        authenticationStrategy: ConnectorAuthenticationStrategy.OAuth2PKCE,
        settingsSchema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
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
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);
      const firstSetRemoteResult = await backend.collections.setRemote(
        createResult.data.id,
        mockConnector.name,
        { clientId: "clientId", clientSecret: "clientSecret" },
        {},
        {
          fromRemoteDocument: {
            source: "",
            compiled: "export default function fromRemoteDocument() {}",
          },
        },
      );
      assert.isTrue(firstSetRemoteResult.success);

      // Exercise
      const secondSetRemoteResult = await backend.collections.setRemote(
        createResult.data.id,
        "DifferentConnector",
        { clientId: "clientId", clientSecret: "clientSecret" },
        {},
        { fromRemoteDocument: { source: "", compiled: "" } },
      );

      // Verify
      expect(secondSetRemoteResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CannotChangeCollectionRemoteConnector",
          details: {
            collectionId: createResult.data.id,
            currentConnectorName: "MockConnector",
            suppliedConnectorName: "DifferentConnector",
          },
        },
      });
    });

    it("error: ConnectorAuthenticationSettingsNotValid (case: OAuth2PKCE)", async () => {
      // Setup mocks
      const mockConnector: Connector.OAuth2PKCE<Schema> = {
        name: "MockConnector",
        authenticationStrategy: ConnectorAuthenticationStrategy.OAuth2PKCE,
        settingsSchema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                setting: { dataType: DataType.String },
              },
            },
          },
          rootType: "Root",
        },
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
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);

      // Exercise
      const setRemoteResult = await backend.collections.setRemote(
        createResult.data.id,
        mockConnector.name,
        { clientId: "clientId" } as any,
        { setting: 0 },
        {
          fromRemoteDocument: {
            source: "",
            compiled: "export default function fromRemoteDocument() {}",
          },
        },
      );

      // Verify
      expect(setRemoteResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "ConnectorAuthenticationSettingsNotValid",
          details: {
            collectionId: createResult.data.id,
            connectorName: mockConnector.name,
            issues: [
              {
                message:
                  'Invalid key: Expected "clientSecret" but received undefined',
                path: [{ key: "clientSecret" }],
              },
            ],
          },
        },
      });
    });

    it("error: ConnectorAuthenticationSettingsNotValid (case: ApiKey)", async () => {
      // Setup mocks
      const mockConnector: Connector.ApiKey<Schema> = {
        name: "MockConnector",
        authenticationStrategy: ConnectorAuthenticationStrategy.ApiKey,
        settingsSchema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                setting: { dataType: DataType.String },
              },
            },
          },
          rootType: "Root",
        },
        remoteDocumentTypescriptSchema: {
          types: "export type RemoteDocument = {};",
          rootType: "RemoteDocument",
        },
        syncDown: async () => ({
          success: true,
          data: {
            changes: { addedOrModified: [], deleted: [] },
            authenticationState: null,
            syncPoint: "syncPoint",
          },
          error: null,
        }),
      };

      // Setup SUT
      const { backend } = deps(mockConnector);
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);

      // Exercise
      const setRemoteResult = await backend.collections.setRemote(
        createResult.data.id,
        mockConnector.name,
        {} as any,
        { setting: 0 },
        {
          fromRemoteDocument: {
            source: "",
            compiled: "export default function fromRemoteDocument() {}",
          },
        },
      );

      // Verify
      expect(setRemoteResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "ConnectorAuthenticationSettingsNotValid",
          details: {
            collectionId: createResult.data.id,
            connectorName: mockConnector.name,
            issues: [
              {
                message:
                  'Invalid key: Expected "apiKey" but received undefined',
                path: [{ key: "apiKey" }],
              },
            ],
          },
        },
      });
    });

    it("error: ConnectorSettingsNotValid (case: schema != null)", async () => {
      // Setup mocks
      const mockConnector: Connector.OAuth2PKCE<Schema> = {
        name: "MockConnector",
        authenticationStrategy: ConnectorAuthenticationStrategy.OAuth2PKCE,
        settingsSchema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                setting: { dataType: DataType.String },
              },
            },
          },
          rootType: "Root",
        },
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
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);

      // Exercise
      const setRemoteResult = await backend.collections.setRemote(
        createResult.data.id,
        mockConnector.name,
        { clientId: "clientId", clientSecret: "clientSecret" },
        { setting: 0 },
        {
          fromRemoteDocument: {
            source: "",
            compiled: "export default function fromRemoteDocument() {}",
          },
        },
      );

      // Verify
      expect(setRemoteResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "ConnectorSettingsNotValid",
          details: {
            connectorName: mockConnector.name,
            issues: [
              {
                message: "Invalid type: Expected string but received 0",
                path: [{ key: "setting" }],
              },
            ],
          },
        },
      });
    });

    it("error: ConnectorSettingsNotValid (case: schema == null)", async () => {
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
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);

      // Exercise
      const setRemoteResult = await backend.collections.setRemote(
        createResult.data.id,
        mockConnector.name,
        { clientId: "clientId", clientSecret: "clientSecret" },
        {},
        {
          fromRemoteDocument: {
            source: "",
            compiled: "export default function fromRemoteDocument() {}",
          },
        },
      );

      // Verify
      expect(setRemoteResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "ConnectorSettingsNotValid",
          details: {
            connectorName: mockConnector.name,
            issues: [
              {
                message: "Invalid type: Expected null but received Object",
              },
            ],
          },
        },
      });
    });

    it("error: RemoteConvertersNotValid", async () => {
      // Setup mocks
      const mockConnector: Connector.OAuth2PKCE<Schema> = {
        name: "MockConnector",
        authenticationStrategy: ConnectorAuthenticationStrategy.OAuth2PKCE,
        settingsSchema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
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
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);

      // Exercise
      const setRemoteResult = await backend.collections.setRemote(
        createResult.data.id,
        mockConnector.name,
        { clientId: "clientId", clientSecret: "clientSecret" },
        {},
        {
          fromRemoteDocument: {
            source: "",
            compiled: "export function fromRemoteDocument() {}",
          },
        },
      );

      // Verify
      expect(setRemoteResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "RemoteConvertersNotValid",
          details: {
            collectionId: createResult.data.id,
            issues: [
              {
                message:
                  "The default export of the fromRemoteDocument TypescriptModule is not a function",
                path: [{ key: "fromRemoteDocument" }],
              },
            ],
          },
        },
      });
    });

    it("success: sets remote (case: w/o previous remote set)", async () => {
      // Setup mocks
      const mockConnector: Connector.OAuth2PKCE<Schema> = {
        name: "MockConnector",
        authenticationStrategy: ConnectorAuthenticationStrategy.OAuth2PKCE,
        settingsSchema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                setting: { dataType: DataType.String },
              },
            },
          },
          rootType: "Root",
        },
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
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);

      // Exercise
      const connectorAuthenticationSettings = {
        clientId: "clientId",
        clientSecret: "clientSecret",
      };
      const connectorSettings = { setting: "setting" };
      const remoteConverters = {
        fromRemoteDocument: {
          source: "",
          compiled: "export default function fromRemoteDocument() {}",
        },
      };
      const setRemoteResult = await backend.collections.setRemote(
        createResult.data.id,
        mockConnector.name,
        connectorAuthenticationSettings,
        connectorSettings,
        remoteConverters,
      );

      // Verify
      expect(setRemoteResult).toEqual({
        success: true,
        data: {
          ...createResult.data,
          latestVersion: {
            ...createResult.data.latestVersion,
            remoteConverters,
          },
          remote: {
            connector: {
              name: mockConnector.name,
              authenticationSettings: connectorAuthenticationSettings,
              settings: connectorSettings,
            },
            connectorAuthenticationState: {
              isAuthenticated: false,
            },
            syncState: {
              down: {
                status: DownSyncStatus.NeverSynced,
                error: null,
                lastSucceededAt: null,
              },
            },
          },
        },
        error: null,
      });
      const listResult = await backend.collections.list();
      expect(listResult).toEqual({
        success: true,
        data: [setRemoteResult.data],
        error: null,
      });
    });

    it("success: sets remote (case: w/ previous remote set)", async () => {
      // Setup mocks
      const mockConnector: Connector.OAuth2PKCE<Schema> = {
        name: "MockConnector",
        authenticationStrategy: ConnectorAuthenticationStrategy.OAuth2PKCE,
        settingsSchema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                setting: { dataType: DataType.String },
              },
            },
          },
          rootType: "Root",
        },
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
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);
      const firstSetRemoteResult = await backend.collections.setRemote(
        createResult.data.id,
        mockConnector.name,
        { clientId: "clientId", clientSecret: "clientSecret" },
        { setting: "setting" },
        {
          fromRemoteDocument: {
            source: "",
            compiled: "export default function fromRemoteDocument() {}",
          },
        },
      );
      assert.isTrue(firstSetRemoteResult.success);

      // Exercise
      const secondSetRemoteResult = await backend.collections.setRemote(
        createResult.data.id,
        mockConnector.name,
        { clientId: "clientId", clientSecret: "clientSecret" },
        { setting: "updated-setting" },
        {
          fromRemoteDocument: {
            source: "",
            compiled: "export default function fromRemoteDocument() {}",
          },
        },
      );

      // Verify
      expect(secondSetRemoteResult).toEqual({
        success: true,
        data: expect.objectContaining({
          remote: expect.objectContaining({
            connector: expect.objectContaining({
              name: mockConnector.name,
              settings: {
                setting: "updated-setting",
              },
            }),
          }),
        }),
        error: null,
      });
      const listResult = await backend.collections.list();
      expect(listResult).toEqual({
        success: true,
        data: [secondSetRemoteResult.data],
        error: null,
      });
    });
  });

  describe("getOAuth2PKCEConnectorAuthorizationRequestUrl", () => {
    it("error: CollectionNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const collectionId = Id.generate.collection();
      const result =
        await backend.collections.getOAuth2PKCEConnectorAuthorizationRequestUrl(
          collectionId,
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

    it("error: CollectionHasNoRemote", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);

      // Exercise
      const getOAuth2PKCEConnectorAuthorizationRequestUrlResult =
        await backend.collections.getOAuth2PKCEConnectorAuthorizationRequestUrl(
          createResult.data.id,
        );

      // Verify
      expect(getOAuth2PKCEConnectorAuthorizationRequestUrlResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionHasNoRemote",
          details: { collectionId: createResult.data.id },
        },
      });
    });

    it("error: ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy", async () => {
      // Setup mocks
      const mockConnector: Connector.ApiKey<Schema> = {
        name: "MockConnector",
        authenticationStrategy: ConnectorAuthenticationStrategy.ApiKey,
        settingsSchema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { setting: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        remoteDocumentTypescriptSchema: {
          types: "export type RemoteDocument = { title: string };",
          rootType: "RemoteDocument",
        },
        syncDown: async () => ({
          success: true,
          data: {
            changes: { addedOrModified: [], deleted: [] },
            authenticationState: null,
            syncPoint: "syncPoint",
          },
          error: null,
        }),
      };

      // Setup SUT
      const { backend } = deps(mockConnector);
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);
      const setRemoteResult = await backend.collections.setRemote(
        createResult.data.id,
        mockConnector.name,
        { apiKey: "apiKey" },
        { setting: "setting" },
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
      const getOAuth2PKCEConnectorAuthorizationRequestUrlResult =
        await backend.collections.getOAuth2PKCEConnectorAuthorizationRequestUrl(
          createResult.data.id,
        );

      // Verify
      expect(getOAuth2PKCEConnectorAuthorizationRequestUrlResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy",
          details: {
            collectionId: createResult.data.id,
            connectorName: mockConnector.name,
          },
        },
      });
    });

    it("success: authenticates OAuth2PKCE connector", async () => {
      // Setup mocks
      const mockAuthorizationRequestUrl = "mockAuthorizationRequestUrl";
      const mockConnector: Connector.OAuth2PKCE<Schema> = {
        name: "MockConnector",
        authenticationStrategy: ConnectorAuthenticationStrategy.OAuth2PKCE,
        settingsSchema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                setting: { dataType: DataType.String },
              },
            },
          },
          rootType: "Root",
        },
        remoteDocumentTypescriptSchema: {
          types: "export type RemoteDocument = { title: string };",
          rootType: "RemoteDocument",
        },
        getAuthorizationRequestUrl: async () => mockAuthorizationRequestUrl,
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
      const createResult = await backend.collections.create(
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
      assert.isTrue(createResult.success);
      const setRemoteResult = await backend.collections.setRemote(
        createResult.data.id,
        mockConnector.name,
        { clientId: "clientId", clientSecret: "clientSecret" },
        { setting: "setting" },
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
      const getOAuth2PKCEConnectorAuthorizationRequestUrlResult =
        await backend.collections.getOAuth2PKCEConnectorAuthorizationRequestUrl(
          createResult.data.id,
        );

      // Verify
      expect(getOAuth2PKCEConnectorAuthorizationRequestUrlResult).toEqual({
        success: true,
        data: mockAuthorizationRequestUrl,
        error: null,
      });
    });
  });

  describe("authenticateOAuth2PKCEConnector", () => {
    it("error: CollectionNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const collectionId = Id.generate.collection();
      const result = await backend.collections.authenticateOAuth2PKCEConnector(
        collectionId,
        "authorizationResponseUrl",
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

    it("error: CollectionHasNoRemote", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);

      // Exercise
      const authenticateOAuth2PKCEConnectorResult =
        await backend.collections.authenticateOAuth2PKCEConnector(
          createResult.data.id,
          "authorizationResponseUrl",
        );

      // Verify
      expect(authenticateOAuth2PKCEConnectorResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionHasNoRemote",
          details: { collectionId: createResult.data.id },
        },
      });
    });

    it("error: ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy", async () => {
      // Setup mocks
      const mockConnector: Connector.ApiKey<Schema> = {
        name: "MockConnector",
        authenticationStrategy: ConnectorAuthenticationStrategy.ApiKey,
        settingsSchema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { setting: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        remoteDocumentTypescriptSchema: {
          types: "export type RemoteDocument = { title: string };",
          rootType: "RemoteDocument",
        },
        syncDown: async () => ({
          success: true,
          data: {
            changes: { addedOrModified: [], deleted: [] },
            authenticationState: null,
            syncPoint: "syncPoint",
          },
          error: null,
        }),
      };

      // Setup SUT
      const { backend } = deps(mockConnector);
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);
      const setRemoteResult = await backend.collections.setRemote(
        createResult.data.id,
        mockConnector.name,
        { apiKey: "apiKey" },
        { setting: "setting" },
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
      const authenticateOAuth2PKCEConnectorResult =
        await backend.collections.authenticateOAuth2PKCEConnector(
          createResult.data.id,
          "authorizationResponseUrl",
        );

      // Verify
      expect(authenticateOAuth2PKCEConnectorResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy",
          details: {
            collectionId: createResult.data.id,
            connectorName: mockConnector.name,
          },
        },
      });
    });

    it("success: authenticates OAuth2PKCE connector", async () => {
      // Setup mocks
      const mockConnector: Connector.OAuth2PKCE<Schema> = {
        name: "MockConnector",
        authenticationStrategy: ConnectorAuthenticationStrategy.OAuth2PKCE,
        settingsSchema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                setting: { dataType: DataType.String },
              },
            },
          },
          rootType: "Root",
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
      const createResult = await backend.collections.create(
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
      assert.isTrue(createResult.success);
      const setRemoteResult = await backend.collections.setRemote(
        createResult.data.id,
        mockConnector.name,
        { clientId: "clientId", clientSecret: "clientSecret" },
        { setting: "setting" },
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
      const authenticateOAuth2PKCEConnectorResult =
        await backend.collections.authenticateOAuth2PKCEConnector(
          createResult.data.id,
          "authorizationResponseUrl",
        );

      // Verify
      expect(authenticateOAuth2PKCEConnectorResult).toEqual({
        success: true,
        data: {
          ...setRemoteResult.data,
          remote: {
            ...setRemoteResult.data.remote,
            connectorAuthenticationState: {
              isAuthenticated: true,
            },
          },
        },
        error: null,
      });
      const listResult = await backend.collections.list();
      expect(listResult).toEqual({
        success: true,
        data: [authenticateOAuth2PKCEConnectorResult.data],
        error: null,
      });
    });
  });

  describe("triggerDownSync", () => {
    it("error: CollectionNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const collectionId = Id.generate.collection();
      const result = await backend.collections.triggerDownSync(collectionId);

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

    it("error: CollectionHasNoRemote", async () => {
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
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const triggerDownSyncResult = await backend.collections.triggerDownSync(
        createCollectionResult.data.id,
      );

      // Verify
      expect(triggerDownSyncResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionHasNoRemote",
          details: { collectionId: createCollectionResult.data.id },
        },
      });
    });

    it("error: CollectionIsSyncing", async () => {
      // Setup mocks
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

      // Exercise
      const firstTriggerDownSyncResult =
        await backend.collections.triggerDownSync(
          createCollectionResult.data.id,
        );
      assert.isTrue(firstTriggerDownSyncResult.success);
      const secondTriggerDownSyncResult =
        await backend.collections.triggerDownSync(
          createCollectionResult.data.id,
        );

      // Verify
      expect(secondTriggerDownSyncResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionIsSyncing",
          details: { collectionId: createCollectionResult.data.id },
        },
      });
    });

    it("error: ConnectorNotAuthenticated", async () => {
      // Setup mocks
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

      // Exercise
      const triggerDownSyncResult = await backend.collections.triggerDownSync(
        createCollectionResult.data.id,
      );

      // Verify
      expect(triggerDownSyncResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "ConnectorNotAuthenticated",
          details: {
            collectionId: createCollectionResult.data.id,
            connectorName: mockConnector.name,
          },
        },
      });
    });

    it("syncing error: UnexpectedError", async () => {
      // Setup mocks
      const syncDownError = {
        name: "UnexpectedError",
        details: { cause: "cause" },
      } as const;
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
        syncDown: async () => ({
          success: false,
          data: null,
          error: syncDownError,
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

      // Exercise
      await triggerAndWaitForDownSync(backend, createCollectionResult.data.id);

      // Verify downSync failed
      const listResult = await backend.collections.list();
      assert.isTrue(listResult.success);
      const collection = listResult.data.find(
        ({ id }) => id === createCollectionResult.data.id,
      );
      assert.isDefined(collection);
      expect(collection.remote?.syncState.down).toEqual(
        expect.objectContaining({
          status: DownSyncStatus.LastSyncFailed,
          error: syncDownError,
        }),
      );
    });

    it("syncing error: ConnectorAuthenticationFailed (resets authentication state)", async () => {
      // Setup mocks
      const syncDownError = {
        name: "ConnectorAuthenticationFailed",
        details: { cause: "cause" },
      } as const;
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
        syncDown: async () => ({
          success: false,
          data: null,
          error: syncDownError,
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

      // Exercise
      await triggerAndWaitForDownSync(backend, createCollectionResult.data.id);

      // Verify downSync failed
      const listResult = await backend.collections.list();
      assert.isTrue(listResult.success);
      const collection = listResult.data.find(
        ({ id }) => id === createCollectionResult.data.id,
      );
      assert.isDefined(collection);
      expect(
        collection.remote?.connectorAuthenticationState.isAuthenticated,
      ).toEqual(false);
      expect(collection.remote?.syncState.down).toEqual(
        expect.objectContaining({
          status: DownSyncStatus.LastSyncFailed,
          error: syncDownError,
        }),
      );
    });

    it("syncing error: ConvertingRemoteDocumentFailed", async () => {
      // Setup mocks
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
          data: {
            changes: {
              addedOrModified: [
                {
                  id: "remoteId",
                  versionId: "remoteVersionId",
                  content: { title: "title" },
                },
              ],
              deleted: [],
            },
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
              'export default function fromRemoteDocument(remote) { throw new Error("converter error"); }',
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

      // Exercise
      await triggerAndWaitForDownSync(backend, createCollectionResult.data.id);

      // Verify
      const listResult = await backend.collections.list();
      assert.isTrue(listResult.success);
      const collection = listResult.data.find(
        ({ id }) => id === createCollectionResult.data.id,
      );
      assert.isDefined(collection);
      expect(collection.remote?.syncState.down).toEqual(
        expect.objectContaining({
          status: DownSyncStatus.LastSyncFailed,
          error: expect.objectContaining({
            name: "SyncingChangesFailed",
            details: expect.objectContaining({
              errors: expect.arrayContaining([
                expect.objectContaining({
                  name: "ConvertingRemoteDocumentFailed",
                  details: expect.objectContaining({
                    remoteDocumentId: "remoteId",
                    remoteDocumentVersionId: "remoteVersionId",
                    cause: expect.objectContaining({
                      name: "ExecutingJavascriptFunctionFailed",
                    }),
                  }),
                }),
              ]),
            }),
          }),
        }),
      );
    });

    it("syncing error: CreatingDocumentFailed", async () => {
      // Setup mocks
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
          data: {
            changes: {
              addedOrModified: [
                {
                  id: "remoteId",
                  versionId: "remoteVersionId",
                  content: { title: "title" },
                },
              ],
              deleted: [],
            },
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
              "export default function fromRemoteDocument(remote) { return {}; }",
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

      // Exercise
      await triggerAndWaitForDownSync(backend, createCollectionResult.data.id);

      // Verify
      const listResult = await backend.collections.list();
      assert.isTrue(listResult.success);
      const collection = listResult.data.find(
        ({ id }) => id === createCollectionResult.data.id,
      );
      assert.isDefined(collection);
      expect(collection.remote?.syncState.down).toEqual(
        expect.objectContaining({
          status: DownSyncStatus.LastSyncFailed,
          error: expect.objectContaining({
            name: "SyncingChangesFailed",
            details: expect.objectContaining({
              errors: expect.arrayContaining([
                expect.objectContaining({
                  name: "CreatingDocumentFailed",
                  details: expect.objectContaining({
                    remoteDocumentId: "remoteId",
                    remoteDocumentVersionId: "remoteVersionId",
                    cause: expect.objectContaining({
                      name: "DocumentContentNotValid",
                    }),
                  }),
                }),
              ]),
            }),
          }),
        }),
      );
    });

    it("syncing error: CreatingNewDocumentVersionFailed", async () => {
      // Setup mocks
      const firstChanges: Connector.Changes = {
        addedOrModified: [
          {
            id: "remoteId",
            versionId: "remoteVersionId1",
            content: { title: "valid" },
          },
        ],
        deleted: [],
      };
      const secondChanges: Connector.Changes = {
        addedOrModified: [
          {
            id: firstChanges.addedOrModified[0]!.id,
            versionId: "remoteVersionId2",
            content: { title: "invalid" },
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
        syncDown: async ({ authenticationState, syncFrom }) => ({
          success: true,
          data:
            syncFrom === null
              ? {
                  changes: firstChanges,
                  authenticationState,
                  syncPoint: "syncPoint1",
                }
              : {
                  changes: secondChanges,
                  authenticationState,
                  syncPoint: "syncPoint2",
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
              'export default function fromRemoteDocument(remote) { if (remote.title === "invalid") { return { title: 123 }; } return { title: remote.title }; }',
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

      // Exercise
      await triggerAndWaitForDownSync(backend, createCollectionResult.data.id);
      await triggerAndWaitForDownSync(backend, createCollectionResult.data.id);

      // Verify
      const listResult = await backend.collections.list();
      assert.isTrue(listResult.success);
      const collection = listResult.data.find(
        ({ id }) => id === createCollectionResult.data.id,
      );
      assert.isDefined(collection);
      expect(collection.remote?.syncState.down).toEqual(
        expect.objectContaining({
          status: DownSyncStatus.LastSyncFailed,
          error: expect.objectContaining({
            name: "SyncingChangesFailed",
            details: expect.objectContaining({
              errors: expect.arrayContaining([
                expect.objectContaining({
                  name: "CreatingNewDocumentVersionFailed",
                  details: expect.objectContaining({
                    remoteDocumentId: "remoteId",
                    remoteDocumentVersionId: "remoteVersionId2",
                    cause: expect.objectContaining({
                      name: "DocumentContentNotValid",
                    }),
                  }),
                }),
              ]),
            }),
          }),
        }),
      );
    });

    it("success: syncs remote changes (case: first sync)", async () => {
      // Setup mocks
      const changes: Connector.Changes = {
        addedOrModified: [
          {
            id: "remoteId1",
            versionId: "remoteVersionId1",
            content: { title: "title1" },
          },
          {
            id: "remoteId2",
            versionId: "remoteVersionId2",
            content: { title: "title2" },
          },
          // This remote document should not be synced.
          {
            id: "remoteId3",
            versionId: "remoteVersionId3",
            content: { title: null },
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
          types: "export type RemoteDocument = { title: string | null };",
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
            compiled: [
              "export default function fromRemoteDocument(remote) {",
              "  return remote.title ? { title: remote.title } : null;",
              "}",
            ].join("\n"),
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

      // Exercise
      await triggerAndWaitForDownSync(backend, createCollectionResult.data.id);

      // Verify downSync succeeded
      const listResult = await backend.collections.list();
      assert.isTrue(listResult.success);
      const collection = listResult.data.find(
        ({ id }) => id === createCollectionResult.data.id,
      );
      assert.isDefined(collection);
      expect(collection.remote?.syncState.down).toEqual(
        expect.objectContaining({
          status: DownSyncStatus.LastSyncSucceeded,
          error: null,
        }),
      );

      // Verify documents were down synced
      const documentsListResult = await backend.documents.list(
        createCollectionResult.data.id,
      );
      assert.isTrue(documentsListResult.success);
      expect(documentsListResult.data).toHaveLength(2);
      expect(documentsListResult.data).toEqual([
        expect.objectContaining({
          id: expect.id("Document"),
          remoteId: "remoteId1",
          collectionId: createCollectionResult.data.id,
          latestVersion: expect.objectContaining({
            id: expect.id("DocumentVersion"),
            remoteId: "remoteVersionId1",
            createdBy: "Connector",
            createdAt: expect.dateCloseToNow(),
          }),
          createdAt: expect.dateCloseToNow(),
        }),
        expect.objectContaining({
          id: expect.id("Document"),
          remoteId: "remoteId2",
          collectionId: createCollectionResult.data.id,
          latestVersion: expect.objectContaining({
            id: expect.id("DocumentVersion"),
            remoteId: "remoteVersionId2",
            createdBy: "Connector",
            createdAt: expect.dateCloseToNow(),
          }),
          createdAt: expect.dateCloseToNow(),
        }),
      ]);
    });

    it("success: syncs remote changes (case: subsequent sync)", async () => {
      // Setup mocks
      const firstChanges: Connector.Changes = {
        addedOrModified: [
          {
            id: "remoteId1",
            versionId: "remoteVersionId1.0",
            content: { title: "title1.0" },
          },
          {
            id: "remoteId2",
            versionId: "remoteVersionId2.0",
            content: { title: "title2.0" },
          },
          {
            id: "remoteId3",
            versionId: "remoteVersionId3.0",
            content: { title: "title3.0" },
          },
          // This remote document should not be synced with the first sync.
          {
            id: "remoteId4",
            versionId: "remoteVersionId4.0",
            content: { title: null },
          },
        ],
        deleted: [],
      };
      const secondChanges: Connector.Changes = {
        addedOrModified: [
          {
            id: "remoteId1",
            versionId: "remoteVersionId1.1",
            content: { title: "title1.1" },
          },
          // This remote document should be deleted with the second sync.
          {
            id: "remoteId3",
            versionId: "remoteVersionId3.1",
            content: { title: null },
          },
          // This remote document should be synced with the second sync.
          {
            id: "remoteId4",
            versionId: "remoteVersionId4.1",
            content: { title: "title4.1" },
          },
          {
            id: "remoteId5",
            versionId: "remoteVersionId5.0",
            content: { title: "title5.0" },
          },
        ],
        deleted: [{ id: "remoteId2" }],
      };
      const mockConnector: Connector.OAuth2PKCE<Schema> = {
        name: "MockConnector",
        authenticationStrategy: ConnectorAuthenticationStrategy.OAuth2PKCE,
        settingsSchema: {
          types: { Settings: { dataType: DataType.Struct, properties: {} } },
          rootType: "Settings",
        },
        remoteDocumentTypescriptSchema: {
          types: "export type RemoteDocument = { title: string | null };",
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
        syncDown: async ({ authenticationState, syncFrom }) => ({
          success: true,
          data:
            syncFrom === null
              ? {
                  changes: firstChanges,
                  authenticationState,
                  syncPoint: "syncPoint1",
                }
              : {
                  changes: secondChanges,
                  authenticationState,
                  syncPoint: "syncPoint2",
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
            compiled: [
              "export default function fromRemoteDocument(remote) {",
              "  return remote.title ? { title: remote.title } : null;",
              "}",
            ].join("\n"),
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

      // Exercise first downSync
      await triggerAndWaitForDownSync(backend, createCollectionResult.data.id);

      // Verify first downSync
      const firstDocumentsListResult = await backend.documents.list(
        createCollectionResult.data.id,
      );
      assert.isTrue(firstDocumentsListResult.success);
      expect(firstDocumentsListResult.data).toHaveLength(3);
      expect(firstDocumentsListResult.data).toEqual([
        expect.objectContaining({
          remoteId: "remoteId1",
          latestVersion: expect.objectContaining({
            remoteId: "remoteVersionId1.0",
          }),
        }),
        expect.objectContaining({
          remoteId: "remoteId2",
          latestVersion: expect.objectContaining({
            remoteId: "remoteVersionId2.0",
          }),
        }),
        expect.objectContaining({
          remoteId: "remoteId3",
          latestVersion: expect.objectContaining({
            remoteId: "remoteVersionId3.0",
          }),
        }),
      ]);

      // Exercise second downSync
      await triggerAndWaitForDownSync(backend, createCollectionResult.data.id);

      // Verify second downSync
      const secondDocumentsListResult = await backend.documents.list(
        createCollectionResult.data.id,
      );
      assert.isTrue(secondDocumentsListResult.success);
      expect(secondDocumentsListResult.data).toHaveLength(3);
      expect(secondDocumentsListResult.data).toEqual([
        expect.objectContaining({
          remoteId: "remoteId1",
          latestVersion: expect.objectContaining({
            remoteId: "remoteVersionId1.1",
          }),
        }),
        expect.objectContaining({
          remoteId: "remoteId4",
          latestVersion: expect.objectContaining({
            remoteId: "remoteVersionId4.1",
          }),
        }),
        expect.objectContaining({
          remoteId: "remoteId5",
          latestVersion: expect.objectContaining({
            remoteId: "remoteVersionId5.0",
          }),
        }),
      ]);
    });
  });

  describe("createNewVersion", () => {
    it("error: CollectionNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const collectionId = Id.generate.collection();
      const latestVersionId = Id.generate.collectionVersion();
      const result = await backend.collections.createNewVersion(
        collectionId,
        latestVersionId,
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        { contentSummaryGetter: { source: "", compiled: "" } },
        { source: "", compiled: "" },
        null,
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

    it("error: CollectionVersionIdNotMatching", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);

      // Exercise
      const latestVersionId = Id.generate.collectionVersion();
      const createNewVersionResult = await backend.collections.createNewVersion(
        createResult.data.id,
        latestVersionId,
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        { contentSummaryGetter: { source: "", compiled: "" } },
        { source: "", compiled: "" },
        null,
      );

      // Verify
      expect(createNewVersionResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionVersionIdNotMatching",
          details: {
            collectionId: createResult.data.id,
            latestVersionId: createResult.data.latestVersion.id,
            suppliedVersionId: latestVersionId,
          },
        },
      });
    });

    it("error: CollectionSchemaNotValid", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);

      // Exercise
      const createNewVersionResult = await backend.collections.createNewVersion(
        createResult.data.id,
        createResult.data.latestVersion.id,
        {
          types: { Root: { dataType: DataType.String } },
          rootType: "Root",
        },
        { contentSummaryGetter: { source: "", compiled: "" } },
        { source: "", compiled: "" },
        null,
      );

      // Verify
      expect(createNewVersionResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionSchemaNotValid",
          details: {
            collectionId: createResult.data.id,
            issues: [
              {
                message: "Root type must be a Struct",
                path: [{ key: "rootType" }],
              },
            ],
          },
        },
      });
    });

    it("error: ContentSummaryGetterNotValid", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);

      // Exercise
      const createNewVersionResult = await backend.collections.createNewVersion(
        createResult.data.id,
        createResult.data.latestVersion.id,
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export function getContentSummary() {}",
          },
        },
        { source: "", compiled: "" },
        null,
      );

      // Verify
      expect(createNewVersionResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "ContentSummaryGetterNotValid",
          details: {
            collectionId: createResult.data.id,
            collectionVersionId: createResult.data.latestVersion.id,
            issues: [
              {
                message:
                  "The default export of the contentSummaryGetter TypescriptModule is not a function",
              },
            ],
          },
        },
      });
    });

    it("error: CollectionMigrationNotValid", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);

      // Exercise
      const createNewVersionResult = await backend.collections.createNewVersion(
        createResult.data.id,
        createResult.data.latestVersion.id,
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
        { source: "", compiled: "export function migrate() {}" },
        null,
      );

      // Verify
      expect(createNewVersionResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionMigrationNotValid",
          details: {
            collectionId: createResult.data.id,
            issues: [
              {
                message:
                  "The default export of the migration TypescriptModule is not a function",
              },
            ],
          },
        },
      });
    });

    it("error: RemoteConvertersNotValid (case: remoteConverters not null when there is no remote)", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);

      // Exercise
      const createNewVersionResult = await backend.collections.createNewVersion(
        createResult.data.id,
        createResult.data.latestVersion.id,
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
        { source: "", compiled: "export default function migrate() {}" },
        {
          fromRemoteDocument: {
            source: "",
            compiled: "export default function fromRemoteDocument() {}",
          },
        },
      );

      // Verify
      expect(createNewVersionResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "RemoteConvertersNotValid",
          details: {
            collectionId: createResult.data.id,
            issues: [
              {
                message:
                  "Collection has no remote; remoteConverters must be null.",
              },
            ],
          },
        },
      });
    });

    it("error: RemoteConvertersNotValid (case: remoteConverters null when there is a remote)", async () => {
      // Setup mocks
      const mockConnector: Connector.OAuth2PKCE<Schema> = {
        name: "MockConnector",
        authenticationStrategy: ConnectorAuthenticationStrategy.OAuth2PKCE,
        settingsSchema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
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
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);
      const setRemoteResult = await backend.collections.setRemote(
        createResult.data.id,
        mockConnector.name,
        { clientId: "clientId", clientSecret: "clientSecret" },
        {},
        {
          fromRemoteDocument: {
            source: "",
            compiled: "export default function fromRemoteDocument() {}",
          },
        },
      );
      assert.isTrue(setRemoteResult.success);

      // Exercise
      const createNewVersionResult = await backend.collections.createNewVersion(
        createResult.data.id,
        createResult.data.latestVersion.id,
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
        { source: "", compiled: "export default function migrate() {}" },
        null,
      );

      // Verify
      expect(createNewVersionResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "RemoteConvertersNotValid",
          details: {
            collectionId: createResult.data.id,
            issues: [
              {
                message:
                  "Collection has a remote; remoteConverters must not be null.",
              },
            ],
          },
        },
      });
    });

    it("error: RemoteConvertersNotValid (case: invalid fromRemoteDocument)", async () => {
      // Setup mocks
      const mockConnector: Connector.OAuth2PKCE<Schema> = {
        name: "MockConnector",
        authenticationStrategy: ConnectorAuthenticationStrategy.OAuth2PKCE,
        settingsSchema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
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
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);
      const setRemoteResult = await backend.collections.setRemote(
        createResult.data.id,
        mockConnector.name,
        { clientId: "clientId", clientSecret: "clientSecret" },
        {},
        {
          fromRemoteDocument: {
            source: "",
            compiled: "export default function fromRemoteDocument() {}",
          },
        },
      );
      assert.isTrue(setRemoteResult.success);

      // Exercise
      const createNewVersionResult = await backend.collections.createNewVersion(
        createResult.data.id,
        createResult.data.latestVersion.id,
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
        { source: "", compiled: "export default function migrate() {}" },
        {
          fromRemoteDocument: {
            source: "",
            compiled: "export function fromRemoteDocument() {}",
          },
        },
      );

      // Verify
      expect(createNewVersionResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "RemoteConvertersNotValid",
          details: {
            collectionId: createResult.data.id,
            issues: [
              {
                message:
                  "The default export of the fromRemoteDocument TypescriptModule is not a function",
                path: [{ key: "fromRemoteDocument" }],
              },
            ],
          },
        },
      });
    });

    it("error: CollectionMigrationFailed (case: migration function throws)", async () => {
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
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create(
        createCollectionResult.data.id,
        {},
      );
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const createNewCollectionVersionResult =
        await backend.collections.createNewVersion(
          createCollectionResult.data.id,
          createCollectionResult.data.latestVersion.id,
          {
            types: { Root: { dataType: DataType.Struct, properties: {} } },
            rootType: "Root",
          },
          {
            contentSummaryGetter: {
              source: "",
              compiled: "export default function getContentSummary() {}",
            },
          },
          {
            source: "",
            compiled:
              'export default function migrate() { throw new Error("Migration error!"); }',
          },
          null,
        );

      // Verify
      expect(createNewCollectionVersionResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionMigrationFailed",
          details: {
            collectionId: createCollectionResult.data.id,
            failedDocumentMigrations: [
              {
                documentId: createDocumentResult.data.id,
                cause: {
                  name: "ApplyingMigrationFailed",
                  details: {
                    name: "Error",
                    message: "Migration error!",
                    stack: expect.any(String),
                  },
                },
              },
            ],
          },
        },
      });
    });

    it("error: CollectionMigrationFailed (case: migrated content not valid)", async () => {
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
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create(
        createCollectionResult.data.id,
        {},
      );
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const createNewCollectionVersionResult =
        await backend.collections.createNewVersion(
          createCollectionResult.data.id,
          createCollectionResult.data.latestVersion.id,
          {
            types: { Root: { dataType: DataType.Struct, properties: {} } },
            rootType: "Root",
          },
          {
            contentSummaryGetter: {
              source: "",
              compiled: "export default function getContentSummary() {}",
            },
          },
          {
            source: "",
            compiled: "export default function migrate() { return { a: 0 }; }",
          },
          null,
        );

      // Verify
      expect(createNewCollectionVersionResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionMigrationFailed",
          details: {
            collectionId: createCollectionResult.data.id,
            failedDocumentMigrations: [
              {
                documentId: createDocumentResult.data.id,
                cause: {
                  name: "CreatingNewDocumentVersionFailed",
                  details: expect.objectContaining({
                    cause: expect.objectContaining({
                      name: "DocumentContentNotValid",
                    }),
                  }),
                },
              },
            ],
          },
        },
      });
    });

    it("success: creates and migrates (case: collection with no remote)", async () => {
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
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create(
        createCollectionResult.data.id,
        {},
      );
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const migration = {
        source: "",
        compiled: "export default function migrate() { return {}; }",
      };
      const createNewCollectionVersionResult =
        await backend.collections.createNewVersion(
          createCollectionResult.data.id,
          createCollectionResult.data.latestVersion.id,
          {
            types: { Root: { dataType: DataType.Struct, properties: {} } },
            rootType: "Root",
          },
          {
            contentSummaryGetter: {
              source: "",
              compiled: "export default function getContentSummary() {}",
            },
          },
          migration,
          null,
        );

      // Verify
      expect(createNewCollectionVersionResult).toEqual({
        success: true,
        data: {
          ...createCollectionResult.data,
          latestVersion: {
            id: expect.id("CollectionVersion"),
            previousVersionId: createCollectionResult.data.latestVersion.id,
            schema: {
              rootType: "Root",
              types: { Root: { dataType: "Struct", properties: {} } },
            },
            settings: {
              contentSummaryGetter: {
                compiled: "export default function getContentSummary() {}",
                source: "",
              },
            },
            migration: migration,
            remoteConverters: null,
            createdAt: expect.dateCloseToNow(),
          },
        },
        error: null,
      });
      assert.isTrue(createNewCollectionVersionResult.success);
      const listCollectionsResult = await backend.collections.list();
      expect(listCollectionsResult).toEqual({
        success: true,
        data: [createNewCollectionVersionResult.data],
        error: null,
      });
      const getDocumentResult = await backend.documents.get(
        createCollectionResult.data.id,
        createDocumentResult.data.id,
      );
      expect(getDocumentResult).toEqual({
        success: true,
        data: {
          ...createDocumentResult.data,
          latestVersion: expect.objectContaining({
            id: expect.id("DocumentVersion"),
            remoteId: null,
            previousVersionId: createDocumentResult.data.latestVersion.id,
            collectionVersionId:
              createNewCollectionVersionResult.data.latestVersion.id,
            content: {},
            conversationId: null,
            createdBy: "Migration",
            createdAt: expect.dateCloseToNow(),
          }),
        },
        error: null,
      });
    });

    it("success: preserves remote ids", async () => {
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
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);
      const remoteConverters = {
        fromRemoteDocument: {
          source: "",
          compiled:
            "export default function fromRemoteDocument(remote) { return { title: remote.title }; }",
        },
      };
      const setRemoteResult = await backend.collections.setRemote(
        createCollectionResult.data.id,
        mockConnector.name,
        { clientId: "clientId", clientSecret: "clientSecret" },
        {},
        remoteConverters,
      );
      assert.isTrue(setRemoteResult.success);
      const authenticateOAuth2PKCEConnectorResult =
        await backend.collections.authenticateOAuth2PKCEConnector(
          createCollectionResult.data.id,
          "authorizationResponseUrl",
        );
      assert.isTrue(authenticateOAuth2PKCEConnectorResult.success);
      await triggerAndWaitForDownSync(backend, createCollectionResult.data.id);

      // Ensure expected pre-migration state
      const beforeMigrationDocumentsListResult = await backend.documents.list(
        createCollectionResult.data.id,
      );
      assert.isTrue(beforeMigrationDocumentsListResult.success);
      expect(beforeMigrationDocumentsListResult.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            remoteId: "remoteDocumentId",
            latestVersion: expect.objectContaining({
              remoteId: "remoteDocumentVersionId",
            }),
          }),
        ]),
      );

      // Exercise
      const createNewCollectionVersionResult =
        await backend.collections.createNewVersion(
          createCollectionResult.data.id,
          createCollectionResult.data.latestVersion.id,
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
              compiled: "export default function getContentSummary() {}",
            },
          },
          {
            source: "",
            compiled:
              "export default function migrate(content) { return content; }",
          },
          remoteConverters,
        );

      // Verify
      assert.isTrue(createNewCollectionVersionResult.success);
      const afterMigrationDocumentsListResult = await backend.documents.list(
        createCollectionResult.data.id,
      );
      assert.isTrue(afterMigrationDocumentsListResult.success);
      expect(afterMigrationDocumentsListResult.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            remoteId: "remoteDocumentId",
            latestVersion: expect.objectContaining({
              remoteId: "remoteDocumentVersionId",
              previousVersionId:
                beforeMigrationDocumentsListResult.data[0]?.latestVersion.id,
            }),
          }),
        ]),
      );
    });
  });

  describe("updateLatestVersionSettings", () => {
    it("error: CollectionNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const collectionId = Id.generate.collection();
      const latestVersionId = Id.generate.collectionVersion();
      const result = await backend.collections.updateLatestVersionSettings(
        collectionId,
        latestVersionId,
        {},
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

    it("error: CollectionVersionIdNotMatching", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);

      // Exercise
      const latestVersionId = Id.generate.collectionVersion();
      const updateLatestVersionSettingsResult =
        await backend.collections.updateLatestVersionSettings(
          createResult.data.id,
          latestVersionId,
          {},
        );

      // Verify
      expect(updateLatestVersionSettingsResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionVersionIdNotMatching",
          details: {
            collectionId: createResult.data.id,
            latestVersionId: createResult.data.latestVersion.id,
            suppliedVersionId: latestVersionId,
          },
        },
      });
    });

    it("error: ContentSummaryGetterNotValid", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);

      // Exercise
      const updateLatestVersionSettingsResult =
        await backend.collections.updateLatestVersionSettings(
          createResult.data.id,
          createResult.data.latestVersion.id,
          {
            contentSummaryGetter: {
              source: "",
              compiled: "export function getContentSummary() {}",
            },
          },
        );

      // Verify
      expect(updateLatestVersionSettingsResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "ContentSummaryGetterNotValid",
          details: {
            collectionId: null,
            collectionVersionId: null,
            issues: [
              {
                message:
                  "The default export of the contentSummaryGetter TypescriptModule is not a function",
              },
            ],
          },
        },
      });
    });

    it("success: updates", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createResult.success);

      // Exercise
      const updateLatestVersionSettingsResult =
        await backend.collections.updateLatestVersionSettings(
          createResult.data.id,
          createResult.data.latestVersion.id,
          {
            contentSummaryGetter: {
              source: "",
              compiled:
                "export default function getContentSummary() { return {}; }",
            },
          },
        );

      // Verify
      expect(updateLatestVersionSettingsResult).toEqual({
        success: true,
        data: {
          id: createResult.data.id,
          latestVersion: {
            ...createResult.data.latestVersion,
            settings: {
              contentSummaryGetter: {
                source: "",
                compiled:
                  "export default function getContentSummary() { return {}; }",
              },
            },
          },
          settings: createResult.data.settings,
          remote: null,
          createdAt: createResult.data.createdAt,
        },
        error: null,
      });
      const listResult = await backend.collections.list();
      expect(listResult).toEqual({
        success: true,
        data: [updateLatestVersionSettingsResult.data],
        error: null,
      });
    });
  });

  describe("delete", () => {
    it("error: CollectionNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const collectionId = Id.generate.collection();
      const result = await backend.collections.delete(collectionId, "delete");

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
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const commandConfirmation = "notDelete";
      const deleteResult = await backend.collections.delete(
        createCollectionResult.data.id,
        commandConfirmation,
      );

      // Verify
      expect(deleteResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CommandConfirmationNotValid",
          details: {
            requiredCommandConfirmation: "delete",
            suppliedCommandConfirmation: commandConfirmation,
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
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create(
        createCollectionResult.data.id,
        {},
      );
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const deleteCollectionResult = await backend.collections.delete(
        createCollectionResult.data.id,
        "delete",
      );

      // Verify
      expect(deleteCollectionResult).toEqual({
        success: true,
        data: null,
        error: null,
      });
      const listCollectionsResult = await backend.collections.list();
      expect(listCollectionsResult).toEqual({
        success: true,
        data: [],
        error: null,
      });
    });
  });

  describe("list", () => {
    it("success: empty list", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.list();

      // Verify
      expect(result).toEqual({
        success: true,
        data: [],
        error: null,
      });
    });

    it("success: non-empty list, sorted by name", async () => {
      // Setup SUT
      const { backend } = deps();
      const zetaCreateResult = await backend.collections.create(
        {
          name: "zeta",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(zetaCreateResult.success);
      const alphaCreateResult = await backend.collections.create(
        {
          name: "alpha",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(alphaCreateResult.success);
      const betaCreateResult = await backend.collections.create(
        {
          name: "beta",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(betaCreateResult.success);

      // Exercise
      const listResult = await backend.collections.list();

      // Verify
      expect(listResult).toEqual({
        success: true,
        data: [
          alphaCreateResult.data,
          betaCreateResult.data,
          zetaCreateResult.data,
        ],
        error: null,
      });
    });
  });
});

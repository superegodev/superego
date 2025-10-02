import type { Connector } from "@superego/executing-backend";
import { DataType } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

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
      // Setup SUT
      const fakeConnector: Connector = {
        name: "FakeConnector",
        remoteDocumentSchema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        syncDown: async () => ({
          success: true,
          data: {
            changes: { addedOrModified: [], deleted: [] },
            syncPoint: "syncPoint",
          },
          error: null,
        }),
      };
      const { backend } = deps(fakeConnector);
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
        fakeConnector.name,
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
      // Setup SUT
      const fakeConnector: Connector = {
        name: "FakeConnector",
        remoteDocumentSchema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        syncDown: async () => ({
          success: true,
          data: {
            changes: { addedOrModified: [], deleted: [] },
            syncPoint: "syncPoint",
          },
          error: null,
        }),
      };
      const { backend } = deps(fakeConnector);
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
        fakeConnector.name,
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

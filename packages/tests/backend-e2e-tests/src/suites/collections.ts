import { AppType } from "@superego/backend";
import { DataType } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("Collections", (deps) => {
  describe("create", () => {
    it("error: ArgumentsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.create({} as any);

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("ArgumentsNotValid");
    });

    it("error: ArgumentsNotValid when schema has extra keys", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
          extra: true,
        } as any,
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("ArgumentsNotValid");
    });

    it("error: CollectionSettingsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.create({
        settings: {
          name: "",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });

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

    it("atomicity: no collections created if one fails validation", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.createMany([
        {
          settings: {
            name: "valid collection",
            icon: null,
            collectionCategoryId: null,
            defaultCollectionViewAppId: null,
            description: null,
            assistantInstructions: null,
            redirectToCollectionAfterDocumentCreation: false,
          },
          schema: {
            types: { Root: { dataType: DataType.Struct, properties: {} } },
            rootType: "Root",
          },
          versionSettings: {
            contentBlockingKeysGetter: null,
            contentSummaryGetter:
              "export default function getContentSummary() { return {}; }",
            defaultDocumentViewUiOptions: null,
          },
        },
        {
          settings: {
            name: "",
            icon: null,
            collectionCategoryId: null,
            defaultCollectionViewAppId: null,
            description: null,
            assistantInstructions: null,
            redirectToCollectionAfterDocumentCreation: false,
          },
          schema: {
            types: { Root: { dataType: DataType.Struct, properties: {} } },
            rootType: "Root",
          },
          versionSettings: {
            contentBlockingKeysGetter: null,
            contentSummaryGetter:
              "export default function getContentSummary() { return {}; }",
            defaultDocumentViewUiOptions: null,
          },
        },
      ]);

      // Verify
      expect(result.success).toBe(false);
      expect(result.error?.name).toBe("CollectionSettingsNotValid");
      const listResult = await backend.collections.list();
      assert.isTrue(listResult.success);
      expect(listResult.data).toHaveLength(0);
    });

    it("error: CollectionCategoryNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const collectionCategoryId = Id.generate.collectionCategory();
      const result = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: collectionCategoryId,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });

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

    it("error: AppNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const defaultCollectionViewAppId = Id.generate.app();
      const result = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "AppNotFound",
          details: { appId: defaultCollectionViewAppId },
        },
      });
    });

    it("error: CollectionSchemaNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.String } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });

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
      const result = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter: "export const value = 1;",
          defaultDocumentViewUiOptions: null,
        },
      });

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

    it("error: ContentBlockingKeysGetterNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: "export const value = 1;",
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "ContentBlockingKeysGetterNotValid",
          details: {
            collectionId: null,
            collectionVersionId: null,
            issues: [
              {
                message:
                  "The default export of the contentBlockingKeysGetter TypescriptModule is not a function",
              },
            ],
          },
        },
      });
    });

    it("error: DefaultDocumentViewUiOptionsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
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
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: {
            fullWidth: false,
            alwaysCollapsePrimarySidebar: false,
            rootLayout: { all: [{ propertyPath: "nonExistent" }] },
          },
        },
      });

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "DefaultDocumentViewUiOptionsNotValid",
          details: {
            collectionId: null,
            collectionVersionId: null,
            issues: [
              {
                message: `Property path "nonExistent" does not exist in the schema.`,
                path: [
                  { key: "rootLayout" },
                  { key: "all" },
                  { key: 0 },
                  { key: "propertyPath" },
                ],
              },
              {
                message: `Layout is missing property "title".`,
                path: [{ key: "rootLayout" }, { key: "all" }],
              },
            ],
          },
        },
      });
    });

    it("error: ReferencedCollectionsNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const nonExistentCollectionId = Id.generate.collection();
      const result = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                documentRef: {
                  dataType: DataType.DocumentRef,
                  collectionId: nonExistentCollectionId,
                },
              },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "ReferencedCollectionsNotFound",
          details: {
            collectionId: null,
            notFoundCollectionIds: [nonExistentCollectionId],
          },
        },
      });
    });

    it("success: creates", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const createResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });

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
              contentBlockingKeysGetter: null,
              contentSummaryGetter:
                "export default function getContentSummary() { return {}; }",
              defaultDocumentViewUiOptions: null,
            },
            migration: null,
            createdAt: expect.dateCloseToNow(),
          },
          settings: {
            name: "name",
            icon: null,
            collectionCategoryId: null,
            defaultCollectionViewAppId: null,
            description: null,
            assistantInstructions: null,
            redirectToCollectionAfterDocumentCreation: false,
          },
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

    it("success: creates (case: with contentBlockingKeysGetter)", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const createResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter:
            "export default function getContentBlockingKeys() { return null; }",
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });

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
              contentBlockingKeysGetter:
                "export default function getContentBlockingKeys() { return null; }",
              contentSummaryGetter:
                "export default function getContentSummary() { return {}; }",
              defaultDocumentViewUiOptions: null,
            },
            migration: null,
            createdAt: expect.dateCloseToNow(),
          },
          settings: {
            name: "name",
            icon: null,
            collectionCategoryId: null,
            defaultCollectionViewAppId: null,
            description: null,
            assistantInstructions: null,
            redirectToCollectionAfterDocumentCreation: false,
          },
          createdAt: expect.dateCloseToNow(),
        },
        error: null,
      });
    });

    it("success: creates (case: with self-referencing DocumentRef)", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const createResult = await backend.collections.create({
        settings: {
          name: "Tasks",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                title: { dataType: DataType.String },
                parent: {
                  dataType: DataType.DocumentRef,
                  collectionId: "self",
                },
                subtasks: {
                  dataType: DataType.List,
                  items: {
                    dataType: DataType.DocumentRef,
                    collectionId: "self",
                  },
                },
              },
              nullableProperties: ["parent"],
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });

      // Verify
      assert(createResult.success);
      const collectionId = createResult.data.id;
      const rootType = createResult.data.latestVersion.schema.types[
        "Root"
      ] as any;
      expect(rootType.properties.parent.collectionId).toBe(collectionId);
      expect(rootType.properties.subtasks.items.collectionId).toBe(
        collectionId,
      );
    });
  });

  describe("createMany", () => {
    it("error: ArgumentsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.createMany([{} as any]);

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("ArgumentsNotValid");
    });

    it("error: CollectionSettingsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.createMany([
        {
          settings: {
            name: "",
            icon: null,
            collectionCategoryId: null,
            defaultCollectionViewAppId: null,
            description: null,
            assistantInstructions: null,
            redirectToCollectionAfterDocumentCreation: false,
          },
          schema: {
            types: { Root: { dataType: DataType.Struct, properties: {} } },
            rootType: "Root",
          },
          versionSettings: {
            contentBlockingKeysGetter: null,
            contentSummaryGetter:
              "export default function getContentSummary() { return {}; }",
            defaultDocumentViewUiOptions: null,
          },
        },
      ]);

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
      const result = await backend.collections.createMany([
        {
          settings: {
            name: "name",
            icon: null,
            collectionCategoryId: collectionCategoryId,
            defaultCollectionViewAppId: null,
            description: null,
            assistantInstructions: null,
            redirectToCollectionAfterDocumentCreation: false,
          },
          schema: {
            types: { Root: { dataType: DataType.Struct, properties: {} } },
            rootType: "Root",
          },
          versionSettings: {
            contentBlockingKeysGetter: null,
            contentSummaryGetter:
              "export default function getContentSummary() { return {}; }",
            defaultDocumentViewUiOptions: null,
          },
        },
      ]);

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

    it("error: AppNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const defaultCollectionViewAppId = Id.generate.app();
      const result = await backend.collections.createMany([
        {
          settings: {
            name: "name",
            icon: null,
            collectionCategoryId: null,
            defaultCollectionViewAppId,
            description: null,
            assistantInstructions: null,
            redirectToCollectionAfterDocumentCreation: false,
          },
          schema: {
            types: { Root: { dataType: DataType.Struct, properties: {} } },
            rootType: "Root",
          },
          versionSettings: {
            contentBlockingKeysGetter: null,
            contentSummaryGetter:
              "export default function getContentSummary() { return {}; }",
            defaultDocumentViewUiOptions: null,
          },
        },
      ]);

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "AppNotFound",
          details: { appId: defaultCollectionViewAppId },
        },
      });
    });

    it("error: CollectionSchemaNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.createMany([
        {
          settings: {
            name: "name",
            icon: null,
            collectionCategoryId: null,
            defaultCollectionViewAppId: null,
            description: null,
            assistantInstructions: null,
            redirectToCollectionAfterDocumentCreation: false,
          },
          schema: {
            types: { Root: { dataType: DataType.String } },
            rootType: "Root",
          },
          versionSettings: {
            contentBlockingKeysGetter: null,
            contentSummaryGetter:
              "export default function getContentSummary() { return {}; }",
            defaultDocumentViewUiOptions: null,
          },
        },
      ]);

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
      const result = await backend.collections.createMany([
        {
          settings: {
            name: "name",
            icon: null,
            collectionCategoryId: null,
            defaultCollectionViewAppId: null,
            description: null,
            assistantInstructions: null,
            redirectToCollectionAfterDocumentCreation: false,
          },
          schema: {
            types: { Root: { dataType: DataType.Struct, properties: {} } },
            rootType: "Root",
          },
          versionSettings: {
            contentBlockingKeysGetter: null,
            contentSummaryGetter: "export const value = 1;",
            defaultDocumentViewUiOptions: null,
          },
        },
      ]);

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

    it("error: ContentBlockingKeysGetterNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.createMany([
        {
          settings: {
            name: "name",
            icon: null,
            collectionCategoryId: null,
            defaultCollectionViewAppId: null,
            description: null,
            assistantInstructions: null,
            redirectToCollectionAfterDocumentCreation: false,
          },
          schema: {
            types: { Root: { dataType: DataType.Struct, properties: {} } },
            rootType: "Root",
          },
          versionSettings: {
            contentBlockingKeysGetter: "export const value = 1;",
            contentSummaryGetter:
              "export default function getContentSummary() { return {}; }",
            defaultDocumentViewUiOptions: null,
          },
        },
      ]);

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "ContentBlockingKeysGetterNotValid",
          details: {
            collectionId: null,
            collectionVersionId: null,
            issues: [
              {
                message:
                  "The default export of the contentBlockingKeysGetter TypescriptModule is not a function",
              },
            ],
          },
        },
      });
    });

    it("error: DefaultDocumentViewUiOptionsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.createMany([
        {
          settings: {
            name: "name",
            icon: null,
            collectionCategoryId: null,
            defaultCollectionViewAppId: null,
            description: null,
            assistantInstructions: null,
            redirectToCollectionAfterDocumentCreation: false,
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
            contentBlockingKeysGetter: null,
            contentSummaryGetter:
              "export default function getContentSummary() { return {}; }",
            defaultDocumentViewUiOptions: {
              fullWidth: false,
              alwaysCollapsePrimarySidebar: false,
              rootLayout: { all: [{ propertyPath: "nonExistent" }] },
            },
          },
        },
      ]);

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "DefaultDocumentViewUiOptionsNotValid",
          details: {
            collectionId: null,
            collectionVersionId: null,
            issues: [
              {
                message: `Property path "nonExistent" does not exist in the schema.`,
                path: [
                  { key: "rootLayout" },
                  { key: "all" },
                  { key: 0 },
                  { key: "propertyPath" },
                ],
              },
              {
                message: `Layout is missing property "title".`,
                path: [{ key: "rootLayout" }, { key: "all" }],
              },
            ],
          },
        },
      });
    });

    it("error: ReferencedCollectionsNotFound (non-existent collection)", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const nonExistentCollectionId = Id.generate.collection();
      const result = await backend.collections.createMany([
        {
          settings: {
            name: "name",
            icon: null,
            collectionCategoryId: null,
            defaultCollectionViewAppId: null,
            description: null,
            assistantInstructions: null,
            redirectToCollectionAfterDocumentCreation: false,
          },
          schema: {
            types: {
              Root: {
                dataType: DataType.Struct,
                properties: {
                  documentRef: {
                    dataType: DataType.DocumentRef,
                    collectionId: nonExistentCollectionId,
                  },
                },
              },
            },
            rootType: "Root",
          },
          versionSettings: {
            contentBlockingKeysGetter: null,
            contentSummaryGetter:
              "export default function getContentSummary() { return {}; }",
            defaultDocumentViewUiOptions: null,
          },
        },
      ]);

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "ReferencedCollectionsNotFound",
          details: {
            collectionId: null,
            notFoundCollectionIds: [nonExistentCollectionId],
          },
        },
      });
    });

    it("error: ReferencedCollectionsNotFound (invalid proto collection id)", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      // Reference a proto collection that doesn't exist in the batch
      const invalidProtoId = Id.generate.protoCollection(99);
      const result = await backend.collections.createMany([
        {
          settings: {
            name: "name",
            icon: null,
            collectionCategoryId: null,
            defaultCollectionViewAppId: null,
            description: null,
            assistantInstructions: null,
            redirectToCollectionAfterDocumentCreation: false,
          },
          schema: {
            types: {
              Root: {
                dataType: DataType.Struct,
                properties: {
                  documentRef: {
                    dataType: DataType.DocumentRef,
                    collectionId: invalidProtoId,
                  },
                },
              },
            },
            rootType: "Root",
          },
          versionSettings: {
            contentBlockingKeysGetter: null,
            contentSummaryGetter:
              "export default function getContentSummary() { return {}; }",
            defaultDocumentViewUiOptions: null,
          },
        },
      ]);

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "ReferencedCollectionsNotFound",
          details: {
            collectionId: null,
            notFoundCollectionIds: [invalidProtoId],
          },
        },
      });
    });

    it("success: creates single collection", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.createMany([
        {
          settings: {
            name: "name",
            icon: null,
            collectionCategoryId: null,
            defaultCollectionViewAppId: null,
            description: null,
            assistantInstructions: null,
            redirectToCollectionAfterDocumentCreation: false,
          },
          schema: {
            types: { Root: { dataType: DataType.Struct, properties: {} } },
            rootType: "Root",
          },
          versionSettings: {
            contentBlockingKeysGetter: null,
            contentSummaryGetter:
              "export default function getContentSummary() { return {}; }",
            defaultDocumentViewUiOptions: null,
          },
        },
      ]);

      // Verify
      expect(result).toEqual({
        success: true,
        data: [
          {
            id: expect.id("Collection"),
            latestVersion: {
              id: expect.id("CollectionVersion"),
              previousVersionId: null,
              schema: {
                types: { Root: { dataType: "Struct", properties: {} } },
                rootType: "Root",
              },
              settings: {
                contentBlockingKeysGetter: null,
                contentSummaryGetter:
                  "export default function getContentSummary() { return {}; }",
                defaultDocumentViewUiOptions: null,
              },
              migration: null,
              createdAt: expect.dateCloseToNow(),
            },
            settings: {
              name: "name",
              icon: null,
              collectionCategoryId: null,
              defaultCollectionViewAppId: null,
              description: null,
              assistantInstructions: null,
              redirectToCollectionAfterDocumentCreation: false,
            },
            createdAt: expect.dateCloseToNow(),
          },
        ],
        error: null,
      });
      const listResult = await backend.collections.list();
      expect(listResult).toEqual({
        success: true,
        data: result.data,
        error: null,
      });
    });

    it("success: creates multiple independent collections", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.createMany([
        {
          settings: {
            name: "collection-1",
            icon: null,
            collectionCategoryId: null,
            defaultCollectionViewAppId: null,
            description: null,
            assistantInstructions: null,
            redirectToCollectionAfterDocumentCreation: false,
          },
          schema: {
            types: { Root: { dataType: DataType.Struct, properties: {} } },
            rootType: "Root",
          },
          versionSettings: {
            contentBlockingKeysGetter: null,
            contentSummaryGetter:
              "export default function getContentSummary() { return {}; }",
            defaultDocumentViewUiOptions: null,
          },
        },
        {
          settings: {
            name: "collection-2",
            icon: null,
            collectionCategoryId: null,
            defaultCollectionViewAppId: null,
            description: null,
            assistantInstructions: null,
            redirectToCollectionAfterDocumentCreation: false,
          },
          schema: {
            types: { Root: { dataType: DataType.Struct, properties: {} } },
            rootType: "Root",
          },
          versionSettings: {
            contentBlockingKeysGetter: null,
            contentSummaryGetter:
              "export default function getContentSummary() { return {}; }",
            defaultDocumentViewUiOptions: null,
          },
        },
      ]);

      // Verify
      expect(result).toEqual({
        success: true,
        data: [
          {
            id: expect.id("Collection"),
            latestVersion: {
              id: expect.id("CollectionVersion"),
              previousVersionId: null,
              schema: {
                types: { Root: { dataType: "Struct", properties: {} } },
                rootType: "Root",
              },
              settings: {
                contentBlockingKeysGetter: null,
                contentSummaryGetter:
                  "export default function getContentSummary() { return {}; }",
                defaultDocumentViewUiOptions: null,
              },
              migration: null,
              createdAt: expect.dateCloseToNow(),
            },
            settings: {
              name: "collection-1",
              icon: null,
              collectionCategoryId: null,
              defaultCollectionViewAppId: null,
              description: null,
              assistantInstructions: null,
              redirectToCollectionAfterDocumentCreation: false,
            },
            createdAt: expect.dateCloseToNow(),
          },
          {
            id: expect.id("Collection"),
            latestVersion: {
              id: expect.id("CollectionVersion"),
              previousVersionId: null,
              schema: {
                types: { Root: { dataType: "Struct", properties: {} } },
                rootType: "Root",
              },
              settings: {
                contentBlockingKeysGetter: null,
                contentSummaryGetter:
                  "export default function getContentSummary() { return {}; }",
                defaultDocumentViewUiOptions: null,
              },
              migration: null,
              createdAt: expect.dateCloseToNow(),
            },
            settings: {
              name: "collection-2",
              icon: null,
              collectionCategoryId: null,
              defaultCollectionViewAppId: null,
              description: null,
              assistantInstructions: null,
              redirectToCollectionAfterDocumentCreation: false,
            },
            createdAt: expect.dateCloseToNow(),
          },
        ],
        error: null,
      });
      const listResult = await backend.collections.list();
      expect(listResult).toEqual({
        success: true,
        data: result.data,
        error: null,
      });
    });

    it("success: creates collections with cross-references using proto collection ids", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      // Collection 0 references Collection 1, and Collection 1 references Collection 0
      const protoCollection0 = Id.generate.protoCollection(0);
      const protoCollection1 = Id.generate.protoCollection(1);
      const result = await backend.collections.createMany([
        {
          settings: {
            name: "authors",
            icon: null,
            collectionCategoryId: null,
            defaultCollectionViewAppId: null,
            description: null,
            assistantInstructions: null,
            redirectToCollectionAfterDocumentCreation: false,
          },
          schema: {
            types: {
              Root: {
                dataType: DataType.Struct,
                properties: {
                  name: { dataType: DataType.String },
                  books: {
                    dataType: DataType.List,
                    items: {
                      dataType: DataType.DocumentRef,
                      collectionId: protoCollection1,
                    },
                  },
                },
              },
            },
            rootType: "Root",
          },
          versionSettings: {
            contentBlockingKeysGetter: null,
            contentSummaryGetter:
              "export default function getContentSummary() { return {}; }",
            defaultDocumentViewUiOptions: null,
          },
        },
        {
          settings: {
            name: "books",
            icon: null,
            collectionCategoryId: null,
            defaultCollectionViewAppId: null,
            description: null,
            assistantInstructions: null,
            redirectToCollectionAfterDocumentCreation: false,
          },
          schema: {
            types: {
              Root: {
                dataType: DataType.Struct,
                properties: {
                  title: { dataType: DataType.String },
                  author: {
                    dataType: DataType.DocumentRef,
                    collectionId: protoCollection0,
                  },
                },
              },
            },
            rootType: "Root",
          },
          versionSettings: {
            contentBlockingKeysGetter: null,
            contentSummaryGetter:
              "export default function getContentSummary() { return {}; }",
            defaultDocumentViewUiOptions: null,
          },
        },
      ]);

      // Verify
      assert.isTrue(result.success);
      assert.isNotNull(result.data);
      expect(result.data).toHaveLength(2);

      const authorsCollection = result.data[0];
      const booksCollection = result.data[1];
      assert.isDefined(authorsCollection);
      assert.isDefined(booksCollection);

      // Verify the proto collection IDs were replaced with actual IDs
      // Authors collection should reference books collection
      const authorsSchema = authorsCollection.latestVersion.schema;
      const authorsRootType = authorsSchema.types["Root"];
      assert.isDefined(authorsRootType);
      assert.equal(authorsRootType.dataType, DataType.Struct);
      if (authorsRootType.dataType === DataType.Struct) {
        expect(authorsRootType.properties["books"]).toEqual({
          dataType: DataType.List,
          items: {
            dataType: DataType.DocumentRef,
            collectionId: booksCollection.id,
          },
        });
      }

      // Books collection should reference authors collection
      const booksSchema = booksCollection.latestVersion.schema;
      const booksRootType = booksSchema.types["Root"];
      assert.isDefined(booksRootType);
      assert.equal(booksRootType.dataType, DataType.Struct);
      if (booksRootType.dataType === DataType.Struct) {
        expect(booksRootType.properties["author"]).toEqual({
          dataType: DataType.DocumentRef,
          collectionId: authorsCollection.id,
        });
      }
    });
  });

  describe("updateSettings", () => {
    it("error: ArgumentsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.updateSettings(
        "not-a-valid-id" as any,
        { name: "name" },
      );

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("ArgumentsNotValid");
    });

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
      const createResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
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
      const createResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
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

    it("error: AppNotFound", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createResult.success);

      // Exercise
      const defaultCollectionViewAppId = Id.generate.app();
      const updateSettingsResult = await backend.collections.updateSettings(
        createResult.data.id,
        { defaultCollectionViewAppId },
      );

      // Verify
      expect(updateSettingsResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "AppNotFound",
          details: { appId: defaultCollectionViewAppId },
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
      const createAppResult = await backend.apps.create({
        type: AppType.CollectionView,
        name: "app",
        targetCollectionIds: [],
        files: {
          "/main.tsx": "export default function App() { return null; }",
        },
      });
      assert.isTrue(createAppResult.success);
      const createResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createResult.success);

      // Exercise
      const updateResult = await backend.collections.updateSettings(
        createResult.data.id,
        {
          name: "updated-name",
          icon: "😃",
          collectionCategoryId: createCollectionCategoryResult.data.id,
          defaultCollectionViewAppId: createAppResult.data.id,
          description: "updated description",
          assistantInstructions: "updated instructions",
          redirectToCollectionAfterDocumentCreation: true,
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
            defaultCollectionViewAppId: createAppResult.data.id,
            description: "updated description",
            assistantInstructions: "updated instructions",
            redirectToCollectionAfterDocumentCreation: true,
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
    it("error: ArgumentsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.createNewVersion(
        Id.generate.collection(),
        Id.generate.collectionVersion(),
        {} as any,
        {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
        "not-a-valid-migration" as any,
      );

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("ArgumentsNotValid");
    });

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
        {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
        "",
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
      const createResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
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
        {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
        "",
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
      const createResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createResult.success);

      // Exercise
      const createNewVersionResult = await backend.collections.createNewVersion(
        createResult.data.id,
        createResult.data.latestVersion.id,
        {
          types: { Root: { dataType: DataType.String } },
          rootType: "Root",
        },
        {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
        "",
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

    it("error: ReferencedCollectionsNotFound", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createResult.success);

      // Exercise
      const nonExistentCollectionId = Id.generate.collection();
      const createNewVersionResult = await backend.collections.createNewVersion(
        createResult.data.id,
        createResult.data.latestVersion.id,
        {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                documentRef: {
                  dataType: DataType.DocumentRef,
                  collectionId: nonExistentCollectionId,
                },
              },
            },
          },
          rootType: "Root",
        },
        {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
        "",
      );

      // Verify
      expect(createNewVersionResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "ReferencedCollectionsNotFound",
          details: {
            collectionId: createResult.data.id,
            notFoundCollectionIds: [nonExistentCollectionId],
          },
        },
      });
    });

    it("error: ContentSummaryGetterNotValid", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
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
          contentBlockingKeysGetter: null,
          contentSummaryGetter: "export const value = 1;",
          defaultDocumentViewUiOptions: null,
        },
        "",
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

    it("error: DefaultDocumentViewUiOptionsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
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
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createResult.success);

      // Exercise
      const createNewVersionResult = await backend.collections.createNewVersion(
        createResult.data.id,
        createResult.data.latestVersion.id,
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
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: {
            fullWidth: false,
            alwaysCollapsePrimarySidebar: false,
            rootLayout: { all: [{ propertyPath: "nonExistent" }] },
          },
        },
        "",
      );

      // Verify
      expect(createNewVersionResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "DefaultDocumentViewUiOptionsNotValid",
          details: {
            collectionId: createResult.data.id,
            collectionVersionId: createResult.data.latestVersion.id,
            issues: [
              {
                message: `Property path "nonExistent" does not exist in the schema.`,
                path: [
                  { key: "rootLayout" },
                  { key: "all" },
                  { key: 0 },
                  { key: "propertyPath" },
                ],
              },
              {
                message: `Layout is missing property "title".`,
                path: [{ key: "rootLayout" }, { key: "all" }],
              },
            ],
          },
        },
      });
    });

    it("error: CollectionMigrationNotValid (case: migration not a default-exported function)", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
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
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
        "export const value = 1;",
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

    it("error: CollectionMigrationFailed (case: migration function throws)", async () => {
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
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: {},
      });
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
            contentBlockingKeysGetter: null,
            contentSummaryGetter:
              "export default function getContentSummary() { return {}; }",
            defaultDocumentViewUiOptions: null,
          },
          'export default function migrate() { throw new Error("Migration error!"); }',
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
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: {},
      });
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
            contentBlockingKeysGetter: null,
            contentSummaryGetter:
              "export default function getContentSummary() { return {}; }",
            defaultDocumentViewUiOptions: null,
          },
          "export default function migrate() { return { extra: true }; }",
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

    it("success: creates and migrates", async () => {
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
          redirectToCollectionAfterDocumentCreation: false,
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
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "title" },
      });
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const migration =
        "export default function migrate(content: { title: string }) { return { updatedTitle: content.title }; }";
      const createNewCollectionVersionResult =
        await backend.collections.createNewVersion(
          createCollectionResult.data.id,
          createCollectionResult.data.latestVersion.id,
          {
            types: {
              Root: {
                dataType: DataType.Struct,
                properties: { updatedTitle: { dataType: DataType.String } },
              },
            },
            rootType: "Root",
          },
          {
            contentBlockingKeysGetter: null,
            contentSummaryGetter:
              "export default function getContentSummary() { return {}; }",
            defaultDocumentViewUiOptions: null,
          },
          migration,
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
              types: {
                Root: {
                  dataType: DataType.Struct,
                  properties: { updatedTitle: { dataType: DataType.String } },
                },
              },
              rootType: "Root",
            },
            settings: {
              contentBlockingKeysGetter: null,
              contentSummaryGetter:
                "export default function getContentSummary() { return {}; }",
              defaultDocumentViewUiOptions: null,
            },
            migration: migration,
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
      const getMigratedDocumentResult = await backend.documents.get(
        createCollectionResult.data.id,
        createDocumentResult.data.id,
      );
      expect(getMigratedDocumentResult).toEqual({
        success: true,
        data: {
          ...createDocumentResult.data,
          latestVersion: expect.objectContaining({
            id: expect.id("DocumentVersion"),
            previousVersionId: createDocumentResult.data.latestVersion.id,
            collectionVersionId:
              createNewCollectionVersionResult.data.latestVersion.id,
            content: {
              updatedTitle: "title",
            },
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
    it("error: ArgumentsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.updateLatestVersionSettings(
        "not-a-valid-id" as any,
        Id.generate.collectionVersion(),
        {},
      );

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("ArgumentsNotValid");
    });

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
      const createResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
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

    it("error: ContentBlockingKeysGetterNotValid", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createResult.success);

      // Exercise
      const updateLatestVersionSettingsResult =
        await backend.collections.updateLatestVersionSettings(
          createResult.data.id,
          createResult.data.latestVersion.id,
          {
            contentBlockingKeysGetter: "export const value = 1;",
          },
        );

      // Verify
      expect(updateLatestVersionSettingsResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "ContentBlockingKeysGetterNotValid",
          details: {
            collectionId: createResult.data.id,
            collectionVersionId: createResult.data.latestVersion.id,
            issues: [
              {
                message:
                  "The default export of the contentBlockingKeysGetter TypescriptModule is not a function",
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
          redirectToCollectionAfterDocumentCreation: false,
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
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "title" },
      });
      assert.isTrue(createDocumentResult.success);

      // Exercise
      const updateLatestVersionSettingsResult =
        await backend.collections.updateLatestVersionSettings(
          createCollectionResult.data.id,
          createCollectionResult.data.latestVersion.id,
          {
            contentBlockingKeysGetter:
              "export default function getContentBlockingKeys() { return 123; }",
          },
        );

      // Verify
      expect(updateLatestVersionSettingsResult).toEqual({
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

    it("error: ContentSummaryGetterNotValid", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createResult.success);

      // Exercise
      const updateLatestVersionSettingsResult =
        await backend.collections.updateLatestVersionSettings(
          createResult.data.id,
          createResult.data.latestVersion.id,
          {
            contentBlockingKeysGetter: null,
            contentSummaryGetter: "export const value = 1;",
            defaultDocumentViewUiOptions: null,
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

    it("error: DefaultDocumentViewUiOptionsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
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
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createResult.success);

      // Exercise
      const updateLatestVersionSettingsResult =
        await backend.collections.updateLatestVersionSettings(
          createResult.data.id,
          createResult.data.latestVersion.id,
          {
            defaultDocumentViewUiOptions: {
              fullWidth: false,
              alwaysCollapsePrimarySidebar: false,
              rootLayout: { all: [{ propertyPath: "nonExistent" }] },
            },
          },
        );

      // Verify
      expect(updateLatestVersionSettingsResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "DefaultDocumentViewUiOptionsNotValid",
          details: {
            collectionId: createResult.data.id,
            collectionVersionId: createResult.data.latestVersion.id,
            issues: [
              {
                message: `Property path "nonExistent" does not exist in the schema.`,
                path: [
                  { key: "rootLayout" },
                  { key: "all" },
                  { key: 0 },
                  { key: "propertyPath" },
                ],
              },
              {
                message: `Layout is missing property "title".`,
                path: [{ key: "rootLayout" }, { key: "all" }],
              },
            ],
          },
        },
      });
    });

    it("success: updates", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createResult.success);

      // Exercise
      const updateLatestVersionSettingsResult =
        await backend.collections.updateLatestVersionSettings(
          createResult.data.id,
          createResult.data.latestVersion.id,
          {
            contentBlockingKeysGetter: null,
            contentSummaryGetter:
              "export default function getContentSummary() { return {}; }",
            defaultDocumentViewUiOptions: null,
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
              contentBlockingKeysGetter: null,
              contentSummaryGetter:
                "export default function getContentSummary() { return {}; }",
              defaultDocumentViewUiOptions: null,
            },
          },
          settings: createResult.data.settings,
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

    it("success: updates and recalculates all blocking keys", async () => {
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
          redirectToCollectionAfterDocumentCreation: false,
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
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Create a document before enabling duplicate detection.
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "title" },
      });
      assert.isTrue(createDocumentResult.success);

      // Update settings to enable duplicate detection.
      const updateLatestVersionSettingsResult =
        await backend.collections.updateLatestVersionSettings(
          createCollectionResult.data.id,
          createCollectionResult.data.latestVersion.id,
          {
            contentBlockingKeysGetter:
              "export default function getContentBlockingKeys(content: { title: string }) { return [content.title]; }",
          },
        );
      assert.isTrue(updateLatestVersionSettingsResult.success);

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

    it("success: updates and recalculates all content summaries", async () => {
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
          redirectToCollectionAfterDocumentCreation: false,
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
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: { title: "title" },
      });
      assert.isTrue(createDocumentResult.success);
      expect(
        createDocumentResult.data.latestVersion.contentSummary.data,
      ).toEqual({});

      // Exercise
      const updateLatestVersionSettingsResult =
        await backend.collections.updateLatestVersionSettings(
          createCollectionResult.data.id,
          createCollectionResult.data.latestVersion.id,
          {
            contentSummaryGetter:
              "export default function getContentSummary(content: { title: string }) { return { title: content.title }; }",
          },
        );
      assert.isTrue(updateLatestVersionSettingsResult.success);

      // Verify
      const getDocumentResult = await backend.documents.get(
        createCollectionResult.data.id,
        createDocumentResult.data.id,
      );
      expect(getDocumentResult.data?.latestVersion.contentSummary.data).toEqual(
        { title: "title" },
      );
    });
  });

  describe("delete", () => {
    it("error: ArgumentsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.delete(
        "not-a-valid-id" as any,
        "delete",
      );

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("ArgumentsNotValid");
    });

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
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
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

    it("error: CollectionIsReferenced", async () => {
      // Setup SUT
      const { backend } = deps();
      // Create collection A (will be referenced)
      const createCollectionAResult = await backend.collections.create({
        settings: {
          name: "Collection A",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createCollectionAResult.success);
      // Create collection B with schema that references collection A
      const createCollectionBResult = await backend.collections.create({
        settings: {
          name: "Collection B",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                documentRef: {
                  dataType: DataType.DocumentRef,
                  collectionId: createCollectionAResult.data.id,
                },
              },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createCollectionBResult.success);

      // Exercise - try to delete collection A which is referenced by collection B's schema
      const deleteResult = await backend.collections.delete(
        createCollectionAResult.data.id,
        "delete",
      );

      // Verify
      expect(deleteResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionIsReferenced",
          details: {
            collectionId: createCollectionAResult.data.id,
            referencingCollectionIds: [createCollectionBResult.data.id],
          },
        },
      });
    });

    it("error: DocumentIsReferenced (cross-collection)", async () => {
      // Setup SUT
      const { backend } = deps();
      // Create collection A with a simple schema
      const createCollectionAResult = await backend.collections.create({
        settings: {
          name: "Collection A",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
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
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createCollectionAResult.success);
      // Create collection B with DocumentRef field (no collectionId constraint to avoid CollectionIsReferenced)
      const createCollectionBResult = await backend.collections.create({
        settings: {
          name: "Collection B",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
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
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createCollectionBResult.success);
      // Create document in collection A
      const createDocumentAResult = await backend.documents.create({
        collectionId: createCollectionAResult.data.id,
        content: { title: "Document A" },
      });
      assert.isTrue(createDocumentAResult.success);
      // Create document in collection B that references document in A
      const createDocumentBResult = await backend.documents.create({
        collectionId: createCollectionBResult.data.id,
        content: {
          documentRef: {
            collectionId: createCollectionAResult.data.id,
            documentId: createDocumentAResult.data.id,
          },
        },
      });
      assert.isTrue(createDocumentBResult.success);

      // Exercise - try to delete collection A which has a document referenced by collection B
      const deleteResult = await backend.collections.delete(
        createCollectionAResult.data.id,
        "delete",
      );

      // Verify
      expect(deleteResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "DocumentIsReferenced",
          details: {
            collectionId: createCollectionAResult.data.id,
            documentId: createDocumentAResult.data.id,
            referencingDocuments: [
              {
                collectionId: createCollectionBResult.data.id,
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
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: {},
      });
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

    it("success: deletes CollectionView apps that only target the deleted collection", async () => {
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
          redirectToCollectionAfterDocumentCreation: false,
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
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createAppResult = await backend.apps.create({
        type: AppType.CollectionView,
        name: "collection view",
        targetCollectionIds: [createCollectionResult.data.id],
        files: {
          "/main.tsx": "export default function App() { return null; }",
        },
      });
      assert.isTrue(createAppResult.success);

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
      const listAppsResult = await backend.apps.list();
      expect(listAppsResult).toEqual({
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
      const zetaCreateResult = await backend.collections.create({
        settings: {
          name: "zeta",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(zetaCreateResult.success);
      const alphaCreateResult = await backend.collections.create({
        settings: {
          name: "alpha",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(alphaCreateResult.success);
      const betaCreateResult = await backend.collections.create({
        settings: {
          name: "beta",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
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

  describe("getVersion", () => {
    it("error: ArgumentsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.getVersion(
        "not-a-valid-id" as any,
        Id.generate.collectionVersion(),
      );

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("ArgumentsNotValid");
    });

    it("error: CollectionVersionNotFound (case: collection does not exist)", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const collectionId = Id.generate.collection();
      const collectionVersionId = Id.generate.collectionVersion();
      const result = await backend.collections.getVersion(
        collectionId,
        collectionVersionId,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionVersionNotFound",
          details: { collectionId, collectionVersionId },
        },
      });
    });

    it("error: CollectionVersionNotFound (case: collection version does not exist)", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
        },
        schema: {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createResult.success);

      // Exercise
      const collectionVersionId = Id.generate.collectionVersion();
      const result = await backend.collections.getVersion(
        createResult.data.id,
        collectionVersionId,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionVersionNotFound",
          details: {
            collectionId: createResult.data.id,
            collectionVersionId,
          },
        },
      });
    });

    it("success: gets (case: latest version)", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
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
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createResult.success);

      // Exercise
      const result = await backend.collections.getVersion(
        createResult.data.id,
        createResult.data.latestVersion.id,
      );

      // Verify
      expect(result).toEqual({
        success: true,
        data: createResult.data.latestVersion,
        error: null,
      });
    });

    it("success: gets (case: non-latest version)", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
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
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createResult.success);
      const migration =
        "export default function migrate(content: { title: string }) { return { updatedTitle: content.title }; }";
      const createNewVersionResult = await backend.collections.createNewVersion(
        createResult.data.id,
        createResult.data.latestVersion.id,
        {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { updatedTitle: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        {
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
        migration,
      );
      assert.isTrue(createNewVersionResult.success);

      // Exercise - get the original version (now a previous version)
      const result = await backend.collections.getVersion(
        createResult.data.id,
        createResult.data.latestVersion.id,
      );

      // Verify
      expect(result).toEqual({
        success: true,
        data: createResult.data.latestVersion,
        error: null,
      });
    });
  });

  describe("getTypescriptSchema", () => {
    it("error: ArgumentsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collections.getTypescriptSchema(
        "not-a-valid-id" as any,
      );

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("ArgumentsNotValid");
    });

    it("success", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
          redirectToCollectionAfterDocumentCreation: false,
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
          contentBlockingKeysGetter: null,
          contentSummaryGetter:
            "export default function getContentSummary() { return {}; }",
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createResult.success);

      // Exercise
      const result = await backend.collections.getTypescriptSchema(
        createResult.data.id,
      );

      // Verify
      assert.isTrue(result.success);
      expect(result.data).toContain("export type Root");
      expect(result.data).toContain("title: string");
    });

    it("error: CollectionNotFound", async () => {
      // Setup SUT
      const { backend } = deps();
      const collectionId = Id.generate.collection();

      // Exercise
      const result =
        await backend.collections.getTypescriptSchema(collectionId);

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
  });
});

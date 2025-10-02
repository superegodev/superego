import { DataType } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it } from "vitest";
import type Dependencies from "../Dependencies.js";

export default rd<Dependencies>("Collections", (deps) => {
  describe("create", () => {
    it("error: CollectionSettingsNotValid", async () => {
      // Setup SUT
      const { backend } = await deps();

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
      const { backend } = await deps();

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
      const { backend } = await deps();

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
      const { backend } = await deps();

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
      const { backend } = await deps();

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
      const { backend } = await deps();

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
      const { backend } = await deps();
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
      const { backend } = await deps();
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
      const { backend } = await deps();
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

  describe("updateLatestVersionSettings", () => {
    it("error: CollectionNotFound", async () => {
      // Setup SUT
      const { backend } = await deps();

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
      const { backend } = await deps();
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
      const suppliedVersionId = Id.generate.collectionVersion();
      const updateLatestVersionSettingsResult =
        await backend.collections.updateLatestVersionSettings(
          createResult.data.id,
          suppliedVersionId,
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
            suppliedVersionId: suppliedVersionId,
          },
        },
      });
    });

    it("error: ContentSummaryGetterNotValid", async () => {
      // Setup SUT
      const { backend } = await deps();
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
      const { backend } = await deps();
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

  describe("list", () => {
    it("success: empty list", async () => {
      // Setup SUT
      const { backend } = await deps();

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
      const { backend } = await deps();
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

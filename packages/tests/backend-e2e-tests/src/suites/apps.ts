import { AppType } from "@superego/backend";
import { DataType } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("Apps", (deps) => {
  describe("create", () => {
    it("error: ArgumentsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.apps.create({} as any);

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("ArgumentsNotValid");
    });

    it("error: AppNameNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.apps.create({
        type: AppType.CollectionView,
        name: "name".repeat(100),
        targetCollectionIds: [],
        files: { "/main.tsx": { source: "", compiled: "" } },
      });

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "AppNameNotValid",
          details: {
            appId: null,
            issues: [
              {
                message: "Invalid length: Expected <=32 but received 400",
                path: undefined,
              },
            ],
          },
        },
      });
    });

    it("error: CollectionNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const collectionId = Id.generate.collection();
      const result = await backend.apps.create({
        type: AppType.CollectionView,
        name: "name",
        targetCollectionIds: [collectionId],
        files: { "/main.tsx": { source: "", compiled: "" } },
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
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const files = { "/main.tsx": { source: "", compiled: "" } };
      const createAppResult = await backend.apps.create({
        type: AppType.CollectionView,
        name: "name",
        targetCollectionIds: [createCollectionResult.data.id],
        files: files,
      });

      // Verify
      expect(createAppResult).toEqual({
        success: true,
        data: {
          id: expect.any(String),
          type: AppType.CollectionView,
          name: "name",
          latestVersion: {
            spec: "",
            id: expect.any(String),
            targetCollections: [
              {
                id: createCollectionResult.data.id,
                versionId: createCollectionResult.data.latestVersion.id,
              },
            ],
            files,
            createdAt: expect.dateCloseToNow(),
          },
          createdAt: expect.dateCloseToNow(),
        },
        error: null,
      });
      const listResult = await backend.apps.list();
      expect(listResult).toEqual({
        success: true,
        data: [createAppResult.data],
        error: null,
      });
    });
  });

  describe("spec-only collection bindings", () => {
    it("keeps the collection versions that match unchanged code", async () => {
      // Setup SUT
      const { backend } = deps();
      const collection = await backend.collections.create({
        settings: {
          name: "Items",
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
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
          defaultDocumentViewUiOptions: null,
        },
      });
      assert(collection.success);
      const files = {
        "/main.tsx": {
          source: "export default 1;",
          compiled: "export default 1;",
        },
      };
      const app = await backend.apps.create({
        type: AppType.CollectionView,
        name: "App",
        targetCollectionIds: [collection.data.id],
        files,
        spec: "Original intent",
      });
      assert(app.success);
      const newCollectionVersion = await backend.collections.createNewVersion(
        collection.data.id,
        collection.data.latestVersion.id,
        collection.data.latestVersion.schema,
        collection.data.latestVersion.settings,
        {
          source: "",
          compiled:
            "export default function migrate(content) { return content; }",
        },
      );
      assert(newCollectionVersion.success);
      expect(newCollectionVersion.data.latestVersion.id).not.toBe(
        collection.data.latestVersion.id,
      );

      // Exercise
      const updated = await backend.apps.createNewVersion(
        app.data.id,
        [collection.data.id],
        files,
        "Revised intent",
      );

      // Verify
      assert(updated.success);
      expect(updated.data.latestVersion.targetCollections).toEqual(
        app.data.latestVersion.targetCollections,
      );
      expect(updated.data.latestVersion.files).toEqual(files);
      expect(updated.data.latestVersion.spec).toBe("Revised intent");
    });
  });

  describe("specifications", () => {
    const files = {
      "/main.tsx": {
        source: "export default 1;",
        compiled: "export default 1;",
      },
    };
    const initialSpec =
      "# Intent\n\nPreserve **Markdown**, whitespace, and caffè.\n";

    it.each([undefined, initialSpec, ""])(
      "creates and lists spec %s",
      async (spec) => {
        // Setup SUT
        const { backend } = deps();

        // Exercise
        const created = await backend.apps.create({
          type: AppType.CollectionView,
          name: "App",
          targetCollectionIds: [],
          files,
          ...(spec === undefined ? {} : { spec }),
        });
        const listed = await backend.apps.list();

        // Verify
        assert(created.success);
        expect(created.data.latestVersion.spec).toBe(spec ?? "");
        assert(listed.success);
        expect(listed.data).toEqual([created.data]);
      },
    );

    it.each([undefined, "# Revised intent", ""])(
      "creates a spec-only version with %s",
      async (spec) => {
        // Setup SUT
        const { backend } = deps();
        const created = await backend.apps.create({
          type: AppType.CollectionView,
          name: "App",
          targetCollectionIds: [],
          files,
          spec: initialSpec,
        });
        assert(created.success);

        // Exercise
        const updated = await backend.apps.createNewVersion(
          created.data.id,
          [],
          files,
          spec,
        );
        const listed = await backend.apps.list();

        // Verify
        assert(updated.success);
        expect(updated.data.latestVersion.spec).toBe(spec ?? initialSpec);
        expect(updated.data.latestVersion.files).toEqual(files);
        expect(updated.data.latestVersion.id).not.toBe(
          created.data.latestVersion.id,
        );
        expect(created.data.latestVersion.spec).toBe(initialSpec);
        assert(listed.success);
        expect(listed.data).toEqual([updated.data]);
      },
    );

    it("preserves the spec when older callers omit the fourth argument", async () => {
      // Setup SUT
      const { backend } = deps();
      const created = await backend.apps.create({
        type: AppType.CollectionView,
        name: "App",
        targetCollectionIds: [],
        files,
        spec: initialSpec,
      });
      assert(created.success);

      // Exercise
      const updated = await backend.apps.createNewVersion(
        created.data.id,
        [],
        files,
      );

      // Verify
      assert(updated.success);
      expect(updated.data.latestVersion.spec).toBe(initialSpec);
    });

    it.each([null, 42, {}])(
      "rejects invalid specs without changing the app: %s",
      async (spec) => {
        // Setup SUT
        const { backend } = deps();
        const definition = {
          type: AppType.CollectionView,
          name: "App",
          targetCollectionIds: [],
          files,
          spec: initialSpec,
        };
        const created = await backend.apps.create(definition);
        assert(created.success);

        // Exercise
        const invalidCreate = await backend.apps.create({
          ...definition,
          spec: spec as any,
        });
        const invalidUpdate = await backend.apps.createNewVersion(
          created.data.id,
          [],
          files,
          spec as any,
        );
        const listed = await backend.apps.list();

        // Verify
        expect(invalidCreate.error?.name).toBe("ArgumentsNotValid");
        expect(invalidUpdate.error?.name).toBe("ArgumentsNotValid");
        assert(listed.success);
        expect(listed.data).toEqual([created.data]);
      },
    );
  });

  describe("updateName", () => {
    it("error: ArgumentsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.apps.updateName(
        "not-a-valid-id" as any,
        "name",
      );

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("ArgumentsNotValid");
    });

    it("error: AppNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const appId = Id.generate.app();
      const result = await backend.apps.updateName(appId, "updated name");

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "AppNotFound",
          details: { appId },
        },
      });
    });

    it("error: AppNameNotValid", async () => {
      // Setup SUT
      const { backend } = deps();
      const createAppResult = await backend.apps.create({
        type: AppType.CollectionView,
        name: "name",
        targetCollectionIds: [],
        files: { "/main.tsx": { source: "", compiled: "" } },
      });
      assert.isTrue(createAppResult.success);

      // Exercise
      const updateNameResult = await backend.apps.updateName(
        createAppResult.data.id,
        "",
      );

      // Verify
      expect(updateNameResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "AppNameNotValid",
          details: {
            appId: createAppResult.data.id,
            issues: [
              {
                message: "Invalid length: Expected >=1 but received 0",
                path: undefined,
              },
            ],
          },
        },
      });
    });

    it("success: updates name", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.apps.create({
        type: AppType.CollectionView,
        name: "name",
        targetCollectionIds: [],
        files: { "/main.tsx": { source: "", compiled: "" } },
      });
      assert.isTrue(createResult.success);

      // Exercise
      const updateNameResult = await backend.apps.updateName(
        createResult.data.id,
        "updated name",
      );

      // Verify
      expect(updateNameResult).toEqual({
        success: true,
        data: {
          id: createResult.data.id,
          type: AppType.CollectionView,
          name: "updated name",
          latestVersion: createResult.data.latestVersion,
          createdAt: createResult.data.createdAt,
        },
        error: null,
      });
      const listResult = await backend.apps.list();
      expect(listResult).toEqual({
        success: true,
        data: [updateNameResult.data],
        error: null,
      });
    });
  });

  describe("createNewVersion", () => {
    it("error: ArgumentsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.apps.createNewVersion(
        Id.generate.app(),
        [],
        {} as any,
      );

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("ArgumentsNotValid");
    });

    it("error: AppNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const appId = Id.generate.app();
      const result = await backend.apps.createNewVersion(appId, [], {
        "/main.tsx": { source: "", compiled: "" },
      });

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "AppNotFound",
          details: { appId },
        },
      });
    });

    it("error: CollectionNotFound", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.apps.create({
        type: AppType.CollectionView,
        name: "name",
        targetCollectionIds: [],
        files: { "/main.tsx": { source: "", compiled: "" } },
      });
      assert.isTrue(createResult.success);

      // Exercise
      const collectionId = Id.generate.collection();
      const createNewVersionResult = await backend.apps.createNewVersion(
        createResult.data.id,
        [collectionId],
        { "/main.tsx": { source: "", compiled: "" } },
      );

      // Verify
      expect(createNewVersionResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionNotFound",
          details: { collectionId },
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
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createCollectionResult.success);
      const initialFiles = {
        "/main.tsx": { source: "initial", compiled: "initial" },
      };
      const createAppResult = await backend.apps.create({
        type: AppType.CollectionView,
        name: "name",
        targetCollectionIds: [],
        files: initialFiles,
      });
      assert.isTrue(createAppResult.success);

      // Exercise
      const updatedFiles = {
        "/main.tsx": { source: "updated", compiled: "updated" },
      };
      const createNewAppVersionResult = await backend.apps.createNewVersion(
        createAppResult.data.id,
        [createCollectionResult.data.id],
        updatedFiles,
      );

      // Verify
      expect(createNewAppVersionResult).toEqual({
        success: true,
        data: {
          id: createAppResult.data.id,
          type: AppType.CollectionView,
          name: "name",
          latestVersion: {
            spec: "",
            id: expect.any(String),
            targetCollections: [
              {
                id: createCollectionResult.data.id,
                versionId: createCollectionResult.data.latestVersion.id,
              },
            ],
            files: updatedFiles,
            createdAt: expect.dateCloseToNow(),
          },
          createdAt: createAppResult.data.createdAt,
        },
        error: null,
      });
      assert.isTrue(createNewAppVersionResult.success);
      expect(createNewAppVersionResult.data.latestVersion.id).not.toEqual(
        createAppResult.data.latestVersion.id,
      );
      const listResult = await backend.apps.list();
      expect(listResult).toEqual({
        success: true,
        data: [createNewAppVersionResult.data],
        error: null,
      });
    });
  });

  describe("delete", () => {
    it("error: ArgumentsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.apps.delete(
        "not-a-valid-id" as any,
        "delete",
      );

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("ArgumentsNotValid");
    });

    it("error: CommandConfirmationNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.apps.delete(Id.generate.app(), "not-delete");

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CommandConfirmationNotValid",
          details: {
            suppliedCommandConfirmation: "not-delete",
            requiredCommandConfirmation: "delete",
          },
        },
      });
    });

    it("error: AppNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const appId = Id.generate.app();
      const result = await backend.apps.delete(appId, "delete");

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "AppNotFound",
          details: { appId },
        },
      });
    });

    it("success: deletes", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.apps.create({
        type: AppType.CollectionView,
        name: "name",
        targetCollectionIds: [],
        files: { "/main.tsx": { source: "", compiled: "" } },
      });
      assert.isTrue(createResult.success);

      // Exercise
      const deleteResult = await backend.apps.delete(
        createResult.data.id,
        "delete",
      );

      // Verify
      expect(deleteResult).toEqual({
        success: true,
        data: null,
        error: null,
      });
      const listResult = await backend.apps.list();
      expect(listResult).toEqual({
        success: true,
        data: [],
        error: null,
      });
    });

    it("success: clears default collection view app", async () => {
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
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createCollectionResult.success);
      const createAppResult = await backend.apps.create({
        type: AppType.CollectionView,
        name: "default-app",
        targetCollectionIds: [createCollectionResult.data.id],
        files: { "/main.tsx": { source: "", compiled: "" } },
      });
      assert.isTrue(createAppResult.success);
      const updateCollectionSettingsResult =
        await backend.collections.updateSettings(
          createCollectionResult.data.id,
          { defaultCollectionViewAppId: createAppResult.data.id },
        );
      assert.isTrue(updateCollectionSettingsResult.success);

      // Exercise
      const deleteResult = await backend.apps.delete(
        createAppResult.data.id,
        "delete",
      );

      // Verify
      expect(deleteResult).toEqual({
        success: true,
        data: null,
        error: null,
      });
      const listCollectionsResult = await backend.collections.list(false);
      expect(listCollectionsResult).toEqual({
        success: true,
        data: [
          {
            ...updateCollectionSettingsResult.data,
            settings: {
              ...updateCollectionSettingsResult.data.settings,
              defaultCollectionViewAppId: null,
            },
          },
        ],
        error: null,
      });
    });
  });

  describe("list", () => {
    it("success: empty list", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.apps.list();

      // Verify
      expect(result).toEqual({ success: true, data: [], error: null });
    });

    it("success: non-empty list, sorted by name", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResultZeta = await backend.apps.create({
        type: AppType.CollectionView,
        name: "zeta",
        targetCollectionIds: [],
        files: { "/main.tsx": { source: "", compiled: "" } },
      });
      assert.isTrue(createResultZeta.success);
      const createResultAlpha = await backend.apps.create({
        type: AppType.CollectionView,
        name: "alpha",
        targetCollectionIds: [],
        files: { "/main.tsx": { source: "", compiled: "" } },
      });
      assert.isTrue(createResultAlpha.success);

      // Exercise
      const listResult = await backend.apps.list();

      // Verify
      expect(listResult).toEqual({
        success: true,
        data: [createResultAlpha.data, createResultZeta.data],
        error: null,
      });
    });
  });
});

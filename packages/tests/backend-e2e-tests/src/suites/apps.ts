import { AppType } from "@superego/backend";
import { DataType } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

const entrypoint = "/dist/index.html" as const;
const appVersionFiles = {
  "/dist/index.html": {
    role: "build",
    mimeType: "text/html",
    hash: "",
    content: "<!doctype html>",
  },
} as const;

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
        targetCollections: [],
        entrypoint,
        files: appVersionFiles,
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
        targetCollections: [
          { id: collectionId, versionId: Id.generate.collectionVersion() },
        ],
        entrypoint,
        files: appVersionFiles,
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
      const files = appVersionFiles;
      const createAppResult = await backend.apps.create({
        type: AppType.CollectionView,
        name: "name",
        targetCollections: [
          {
            id: createCollectionResult.data.id,
            versionId: createCollectionResult.data.latestVersion.id,
          },
        ],
        entrypoint,
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
            id: expect.any(String),
            targetCollections: [
              {
                id: createCollectionResult.data.id,
                versionId: createCollectionResult.data.latestVersion.id,
              },
            ],
            entrypoint,
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
        targetCollections: [],
        entrypoint,
        files: appVersionFiles,
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
        targetCollections: [],
        entrypoint,
        files: appVersionFiles,
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
        "/index.html" as any,
        appVersionFiles,
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
      const result = await backend.apps.createNewVersion(
        appId,
        [],
        entrypoint,
        appVersionFiles,
      );

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
        targetCollections: [],
        entrypoint,
        files: appVersionFiles,
      });
      assert.isTrue(createResult.success);

      // Exercise
      const collectionId = Id.generate.collection();
      const createNewVersionResult = await backend.apps.createNewVersion(
        createResult.data.id,
        [{ id: collectionId, versionId: Id.generate.collectionVersion() }],
        entrypoint,
        appVersionFiles,
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
        "/dist/index.html": {
          role: "build",
          mimeType: "text/html",
          hash: "",
          content: "initial",
        },
      } as const;
      const createAppResult = await backend.apps.create({
        type: AppType.CollectionView,
        name: "name",
        targetCollections: [],
        entrypoint,
        files: initialFiles,
      });
      assert.isTrue(createAppResult.success);

      // Exercise
      const updatedFiles = {
        "/dist/index.html": {
          role: "build",
          mimeType: "text/html",
          hash: "",
          content: "updated",
        },
      } as const;
      const createNewAppVersionResult = await backend.apps.createNewVersion(
        createAppResult.data.id,
        [
          {
            id: createCollectionResult.data.id,
            versionId: createCollectionResult.data.latestVersion.id,
          },
        ],
        entrypoint,
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
            id: expect.any(String),
            targetCollections: [
              {
                id: createCollectionResult.data.id,
                versionId: createCollectionResult.data.latestVersion.id,
              },
            ],
            entrypoint,
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
        targetCollections: [],
        entrypoint,
        files: appVersionFiles,
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
        targetCollections: [
          {
            id: createCollectionResult.data.id,
            versionId: createCollectionResult.data.latestVersion.id,
          },
        ],
        entrypoint,
        files: appVersionFiles,
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
      const listCollectionsResult = await backend.collections.list();
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
        targetCollections: [],
        entrypoint,
        files: appVersionFiles,
      });
      assert.isTrue(createResultZeta.success);
      const createResultAlpha = await backend.apps.create({
        type: AppType.CollectionView,
        name: "alpha",
        targetCollections: [],
        entrypoint,
        files: appVersionFiles,
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

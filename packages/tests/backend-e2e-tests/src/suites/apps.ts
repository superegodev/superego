import { AppType, type Backend, type Collection } from "@superego/backend";
import { DataType } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

const entrypoint = "/dist/index.html" as const;
const appVersionFiles = {
  "/src/main.js": {
    role: "source",
    mimeType: "text/javascript",
    content: "console.log('hello');",
  },
  "/package.json": {
    role: "projectConfig",
    mimeType: "application/json",
    content: "{}",
  },
  "/dist/index.html": {
    role: "build",
    mimeType: "text/html",
    content: "<!doctype html>",
  },
} as const;

async function createTestCollection(
  backend: Backend,
  name: string,
): Promise<Collection> {
  const createCollectionResult = await backend.collections.create({
    settings: {
      name,
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
        compiled: "export default function getContentSummary() { return {}; }",
      },
      defaultDocumentViewUiOptions: null,
    },
  });
  if (!createCollectionResult.success) {
    throw new Error(JSON.stringify(createCollectionResult.error, null, 2));
  }
  return createCollectionResult.data;
}

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

    it("error: AppVersionNotValid when /dist/index.html is missing", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.apps.create({
        type: AppType.CollectionView,
        name: "name",
        targetCollections: [],
        entrypoint,
        files: {
          "/src/main.js": appVersionFiles["/src/main.js"],
        },
      });

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("AppVersionNotValid");
      expect((result.error.details as any).issues).toContainEqual({
        message: "Missing /dist/index.html.",
        path: [{ key: "files" }, { key: "/dist/index.html" }],
      });
    });

    it("error: AppVersionNotValid when app version is build-only", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.apps.create({
        type: AppType.CollectionView,
        name: "name",
        targetCollections: [],
        entrypoint,
        files: {
          "/dist/index.html": appVersionFiles["/dist/index.html"],
        },
      });

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("AppVersionNotValid");
      expect((result.error.details as any).issues).toContainEqual({
        message: "App version must include at least one source file.",
        path: [{ key: "files" }],
      });
    });

    it("error: AppVersionNotValid when app version persists /superego files", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.apps.create({
        type: AppType.CollectionView,
        name: "name",
        targetCollections: [],
        entrypoint,
        files: {
          ...appVersionFiles,
          "/superego/app.ts": {
            role: "source",
            mimeType: "text/typescript",
            content: "",
          },
        },
      });

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("AppVersionNotValid");
      expect((result.error.details as any).issues).toContainEqual({
        message:
          "Reserved checkout file must not be persisted: /superego/app.ts.",
        path: [{ key: "files" }, { key: "/superego/app.ts" }],
      });
    });

    it("error: AppVersionNotValid when app version persists superego.app.json", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.apps.create({
        type: AppType.CollectionView,
        name: "name",
        targetCollections: [],
        entrypoint,
        files: {
          ...appVersionFiles,
          "/superego.app.json": {
            role: "source",
            mimeType: "application/json",
            content: "{}",
          },
        },
      });

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("AppVersionNotValid");
      expect((result.error.details as any).issues).toContainEqual({
        message:
          "Reserved checkout file must not be persisted: /superego.app.json.",
        path: [{ key: "files" }, { key: "/superego.app.json" }],
      });
    });

    it("error: AppVersionNotValid when collection version belongs to another collection", async () => {
      // Setup SUT
      const { backend } = deps();
      const firstCollection = await createTestCollection(backend, "first");
      const secondCollection = await createTestCollection(backend, "second");

      // Exercise
      const result = await backend.apps.create({
        type: AppType.CollectionView,
        name: "name",
        targetCollections: [
          {
            id: firstCollection.id,
            versionId: secondCollection.latestVersion.id,
          },
        ],
        entrypoint,
        files: appVersionFiles,
      });

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("AppVersionNotValid");
      expect((result.error.details as any).issues).toContainEqual({
        message: `Collection version ${secondCollection.latestVersion.id} does not belong to collection ${firstCollection.id}.`,
        path: [{ key: "targetCollections" }, { key: 0 }, { key: "versionId" }],
      });
    });

    it("error: AppVersionNotValid when target collections contain duplicates", async () => {
      // Setup SUT
      const { backend } = deps();
      const collection = await createTestCollection(backend, "name");

      // Exercise
      const result = await backend.apps.create({
        type: AppType.CollectionView,
        name: "name",
        targetCollections: [
          {
            id: collection.id,
            versionId: collection.latestVersion.id,
          },
          {
            id: collection.id,
            versionId: collection.latestVersion.id,
          },
        ],
        entrypoint,
        files: appVersionFiles,
      });

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("AppVersionNotValid");
      expect((result.error.details as any).issues).toContainEqual({
        message: `Duplicate target collection: ${collection.id}.`,
        path: [{ key: "targetCollections" }, { key: 1 }, { key: "id" }],
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

    it("error: AppVersionNotValid", async () => {
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
      const createNewVersionResult = await backend.apps.createNewVersion(
        createResult.data.id,
        [],
        entrypoint,
        {
          "/dist/index.html": appVersionFiles["/dist/index.html"],
        },
      );

      // Verify
      assert(!createNewVersionResult.success);
      expect(createNewVersionResult.error.name).toBe("AppVersionNotValid");
      expect(createNewVersionResult.error.details).toEqual({
        appId: createResult.data.id,
        appVersionId: null,
        issues: [
          {
            message: "App version must include at least one source file.",
            path: [{ key: "files" }],
          },
        ],
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
        "/src/main.js": {
          role: "source",
          mimeType: "text/javascript",
          content: "console.log('initial');",
        },
        "/dist/index.html": {
          role: "build",
          mimeType: "text/html",
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
        "/src/main.js": {
          role: "source",
          mimeType: "text/javascript",
          content: "console.log('updated');",
        },
        "/dist/index.html": {
          role: "build",
          mimeType: "text/html",
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

  describe("getVersionBuildFile", () => {
    it("success: returns exact-version text and binary build files", async () => {
      // Setup SUT
      const { backend } = deps();
      const files = {
        ...appVersionFiles,
        "/dist/image.png": {
          role: "build",
          mimeType: "image/png",
          content: new Uint8Array([1, 2, 3]),
        },
      } as const;
      const createResult = await backend.apps.create({
        type: AppType.CollectionView,
        name: "name",
        targetCollections: [],
        entrypoint,
        files,
      });
      assert.isTrue(createResult.success);

      // Exercise
      const htmlFileResult = await backend.apps.getVersionBuildFile(
        createResult.data.id,
        createResult.data.latestVersion.id,
        "/dist/index.html",
      );
      const imageFileResult = await backend.apps.getVersionBuildFile(
        createResult.data.id,
        createResult.data.latestVersion.id,
        "/dist/image.png",
      );

      // Verify
      expect(htmlFileResult).toEqual({
        success: true,
        data: files["/dist/index.html"],
        error: null,
      });
      expect(imageFileResult).toEqual({
        success: true,
        data: files["/dist/image.png"],
        error: null,
      });
    });

    it("error: AppVersionNotFound when the version belongs to another app", async () => {
      // Setup SUT
      const { backend } = deps();
      const firstCreateResult = await backend.apps.create({
        type: AppType.CollectionView,
        name: "first",
        targetCollections: [],
        entrypoint,
        files: appVersionFiles,
      });
      assert.isTrue(firstCreateResult.success);
      const secondCreateResult = await backend.apps.create({
        type: AppType.CollectionView,
        name: "second",
        targetCollections: [],
        entrypoint,
        files: appVersionFiles,
      });
      assert.isTrue(secondCreateResult.success);

      // Exercise
      const result = await backend.apps.getVersionBuildFile(
        firstCreateResult.data.id,
        secondCreateResult.data.latestVersion.id,
        "/dist/index.html",
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "AppVersionNotFound",
          details: {
            appId: firstCreateResult.data.id,
            appVersionId: secondCreateResult.data.latestVersion.id,
          },
        },
      });
    });

    it("error: AppVersionFileNotFound for source, project config, traversal, and missing paths", async () => {
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
      const sourceResult = await backend.apps.getVersionBuildFile(
        createResult.data.id,
        createResult.data.latestVersion.id,
        "/src/main.js",
      );
      const projectConfigResult = await backend.apps.getVersionBuildFile(
        createResult.data.id,
        createResult.data.latestVersion.id,
        "/package.json",
      );
      const traversalResult = await backend.apps.getVersionBuildFile(
        createResult.data.id,
        createResult.data.latestVersion.id,
        "/dist/../src/main.js",
      );
      const missingResult = await backend.apps.getVersionBuildFile(
        createResult.data.id,
        createResult.data.latestVersion.id,
        "/dist/missing.js",
      );

      // Verify
      for (const [path, result] of [
        ["/src/main.js", sourceResult],
        ["/package.json", projectConfigResult],
        ["/dist/../src/main.js", traversalResult],
        ["/dist/missing.js", missingResult],
      ] as const) {
        expect(result).toEqual({
          success: false,
          data: null,
          error: {
            name: "AppVersionFileNotFound",
            details: {
              appId: createResult.data.id,
              appVersionId: createResult.data.latestVersion.id,
              path,
            },
          },
        });
      }
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

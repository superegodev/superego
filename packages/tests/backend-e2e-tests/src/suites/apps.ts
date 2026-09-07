import {
  type AppDefinition,
  type App,
  type Backend,
  AppType,
} from "@superego/backend";
import { type Schema, DataType } from "@superego/schema";
import { defaultAppPermissions } from "@superego/shared-utils";
import { emptyAppStateDefinition } from "@superego/shared-utils";
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
        permissions: defaultAppPermissions,
        stateDefinition: emptyAppStateDefinition,
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
        permissions: defaultAppPermissions,
        stateDefinition: emptyAppStateDefinition,
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
        permissions: defaultAppPermissions,
        stateDefinition: emptyAppStateDefinition,
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
            permissions: defaultAppPermissions,
            stateDefinition: emptyAppStateDefinition,
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
        permissions: defaultAppPermissions,
        stateDefinition: emptyAppStateDefinition,
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
        permissions: defaultAppPermissions,
        stateDefinition: emptyAppStateDefinition,
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
        Id.generate.appVersion(),
        [],
        {} as any,
        defaultAppPermissions,
        emptyAppStateDefinition,
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
        Id.generate.appVersion(),
        [],
        {
          "/main.tsx": { source: "", compiled: "" },
        },
        defaultAppPermissions,
        emptyAppStateDefinition,
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
        permissions: defaultAppPermissions,
        stateDefinition: emptyAppStateDefinition,
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
        createResult.data.latestVersion.id,
        [collectionId],
        { "/main.tsx": { source: "", compiled: "" } },
        createResult.data.latestVersion.permissions,
        { ...createResult.data.latestVersion.stateDefinition, migration: null },
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
        permissions: defaultAppPermissions,
        stateDefinition: emptyAppStateDefinition,
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
        createAppResult.data.latestVersion.id,
        [createCollectionResult.data.id],
        updatedFiles,
        createAppResult.data.latestVersion.permissions,
        {
          ...createAppResult.data.latestVersion.stateDefinition,
          migration: null,
        },
      );

      // Verify
      expect(createNewAppVersionResult).toEqual({
        success: true,
        data: {
          id: createAppResult.data.id,
          type: AppType.CollectionView,
          name: "name",
          latestVersion: {
            permissions: defaultAppPermissions,
            stateDefinition: emptyAppStateDefinition,
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
        permissions: defaultAppPermissions,
        stateDefinition: emptyAppStateDefinition,
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
        permissions: defaultAppPermissions,
        stateDefinition: emptyAppStateDefinition,
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
        permissions: defaultAppPermissions,
        stateDefinition: emptyAppStateDefinition,
        type: AppType.CollectionView,
        name: "zeta",
        targetCollectionIds: [],
        files: { "/main.tsx": { source: "", compiled: "" } },
      });
      assert.isTrue(createResultZeta.success);
      const createResultAlpha = await backend.apps.create({
        permissions: defaultAppPermissions,
        stateDefinition: emptyAppStateDefinition,
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
  describe("getState", () => {
    it.each([
      ["not-a-valid-id", Id.generate.appVersion()],
      [Id.generate.app(), "not-a-valid-id"],
    ])("error: ArgumentsNotValid for ids %s, %s", async (appId, versionId) => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.apps.getState(
        appId as any,
        versionId as any,
      );

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("ArgumentsNotValid");
    });
  });

  describe("updateState", () => {
    it.each([
      ["not-a-valid-id", Id.generate.appVersion(), 1],
      [Id.generate.app(), "not-a-valid-id", 1],
      [Id.generate.app(), Id.generate.appVersion(), "1"],
      [Id.generate.app(), Id.generate.appVersion(), 0],
      [Id.generate.app(), Id.generate.appVersion(), -1],
      [Id.generate.app(), Id.generate.appVersion(), 1.5],
      [
        Id.generate.app(),
        Id.generate.appVersion(),
        Number.MAX_SAFE_INTEGER + 1,
      ],
    ])(
      "error: ArgumentsNotValid for ids %s, %s and revision %s",
      async (appId, versionId, revision) => {
        // Setup SUT
        const { backend } = deps();

        // Exercise
        const result = await backend.apps.updateState(
          appId as any,
          versionId as any,
          revision as any,
          {},
        );

        // Verify
        assert(!result.success);
        expect(result.error.name).toBe("ArgumentsNotValid");
      },
    );

    it("error: AppNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const appId = Id.generate.app();
      const result = await backend.apps.updateState(
        appId,
        Id.generate.appVersion(),
        1,
        {},
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: { name: "AppNotFound", details: { appId } },
      });
    });
  });

  describe("permissions and persistent state", () => {
    const schema: Schema = {
      types: {
        State: {
          dataType: DataType.Struct,
          properties: { count: { dataType: DataType.Number } },
        },
      },
      rootType: "State",
    };
    const definition: AppDefinition = {
      type: AppType.CollectionView,
      name: "Stateful app",
      targetCollectionIds: [],
      files: { "/main.tsx": { source: "", compiled: "" } },
      stateDefinition: { migration: null, schema, initialState: { count: 0 } },
      permissions: {
        downloads: false,
        modals: true,
        http: { allowedOrigins: ["https://example.com"] },
      },
    };
    const read = (backend: Backend, app: App) =>
      backend.apps.getState(app.id, app.latestVersion.id);
    const update = (
      backend: Backend,
      app: App,
      revision: number,
      content: any,
    ) =>
      backend.apps.updateState(app.id, app.latestVersion.id, revision, content);

    it.each([
      { permissions: undefined },
      { permissions: { modals: false } },
      { permissions: { ...defaultAppPermissions, downloads: undefined } },
      { permissions: { ...defaultAppPermissions, http: undefined } },
      { stateDefinition: undefined },
      { stateDefinition: { schema, initialState: { count: 0 } } },
    ])("rejects missing required definition fields: %j", async (overrides) => {
      // Setup SUT
      const { backend } = deps();
      const created = await backend.apps.create(definition);
      assert(created.success);
      const invalidDefinition = {
        ...definition,
        ...overrides,
      } as AppDefinition;

      // Exercise
      const creation = await backend.apps.create(invalidDefinition);
      const version = await backend.apps.createNewVersion(
        created.data.id,
        created.data.latestVersion.id,
        [],
        definition.files,
        invalidDefinition.permissions,
        invalidDefinition.stateDefinition,
      );

      // Verify
      expect(creation.error?.name).toBe("ArgumentsNotValid");
      expect(version.error?.name).toBe("ArgumentsNotValid");
      expect((await backend.apps.list()).data).toEqual([created.data]);
      expect((await read(backend, created.data)).data).toEqual({
        content: { count: 0 },
        revision: 1,
      });
    });

    it("validates the schema before initial content on creation and version updates", async () => {
      // Setup SUT
      const { backend } = deps();
      const created = await backend.apps.create(definition);
      assert(created.success);
      const invalidState = {
        ...definition.stateDefinition,
        schema: { ...schema, rootType: "Missing" },
        initialState: { count: "invalid" },
      };

      // Exercise
      const creation = await backend.apps.create({
        ...definition,
        stateDefinition: invalidState,
      });
      const version = await backend.apps.createNewVersion(
        created.data.id,
        created.data.latestVersion.id,
        [],
        definition.files,
        definition.permissions,
        invalidState,
      );

      // Verify
      for (const [result, appId] of [
        [creation, null],
        [version, created.data.id],
      ] as const) {
        expect(result.error).toEqual({
          name: "AppStateSchemaNotValid",
          details: {
            appId,
            issues: expect.arrayContaining([
              expect.objectContaining({ message: expect.any(String) }),
            ]),
          },
        });
      }
      expect((await backend.apps.list()).data).toEqual([created.data]);
    });

    it("uses initial content on creation and runs every supplied migration until explicitly set to null", async () => {
      // Setup SUT
      const { backend } = deps();
      const stateDefinition = {
        ...definition.stateDefinition,
        migration: {
          source: "",
          compiled:
            "export default (previous) => ({ count: previous.count + 1 });",
        },
      };

      // Exercise
      const created = await backend.apps.create({
        ...definition,
        stateDefinition,
      });
      assert(created.success);
      const initial = await read(backend, created.data);
      let app = created.data;
      for (let i = 0; i < 2; i++) {
        const version = await backend.apps.createNewVersion(
          app.id,
          app.latestVersion.id,
          [],
          definition.files,
          definition.permissions,
          stateDefinition,
        );
        assert(version.success);
        app = version.data;
      }
      const migrated = await read(backend, app);
      const version = await backend.apps.createNewVersion(
        app.id,
        app.latestVersion.id,
        [],
        definition.files,
        defaultAppPermissions,
        { ...stateDefinition, migration: null },
      );
      assert(version.success);
      const preserved = await read(backend, version.data);

      // Verify
      expect(initial.data).toEqual({ content: { count: 0 }, revision: 1 });
      expect(migrated.data).toEqual({ content: { count: 2 }, revision: 3 });
      expect(preserved).toEqual(migrated);
      expect(version.data.latestVersion.stateDefinition.migration).toBeNull();
      expect(version.data.latestVersion.permissions).toEqual(
        defaultAppPermissions,
      );
    });

    it("initializes once and preserves state and permissions on code updates", async () => {
      // Setup SUT
      const { backend } = deps();
      // Exercise
      const created = await backend.apps.create(definition);
      assert(created.success);
      const initial = await read(backend, created.data);
      assert(initial.success);
      const saved = await update(backend, created.data, initial.data.revision, {
        count: 3,
      });
      const version = await backend.apps.createNewVersion(
        created.data.id,
        created.data.latestVersion.id,
        [],
        definition.files,
        created.data.latestVersion.permissions,
        { ...created.data.latestVersion.stateDefinition, migration: null },
      );
      assert(version.success);
      const after = await read(backend, version.data);
      const listed = await backend.apps.list();
      // Verify
      expect(initial.data.content).toEqual({ count: 0 });
      expect(
        created.data.latestVersion.permissions?.http?.allowedOrigins,
      ).toEqual(["https://example.com"]);
      expect(saved.success).toBe(true);
      expect(after).toEqual(saved);
      expect(version.data.latestVersion.permissions).toEqual(
        created.data.latestVersion.permissions,
      );
      expect(created.data).not.toHaveProperty("state");
      expect(listed.data).toEqual([version.data]);
      for (const app of [created.data, version.data, ...listed.data!]) {
        expect(app.latestVersion.stateDefinition).toEqual(
          definition.stateDefinition,
        );
        expect(app.latestVersion).not.toHaveProperty("state");
      }
    });

    it("rejects unknown capabilities and missing state definitions", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const invalid = await backend.apps.create({
        ...definition,
        permissions: { sandbox: ["allow-top-navigation"] },
      } as any);
      const missingState = await backend.apps.create({
        ...definition,
        stateDefinition: undefined,
      } as any);
      const empty = await backend.apps.create({
        ...definition,
        stateDefinition: emptyAppStateDefinition,
      });
      assert(empty.success);
      const state = await read(backend, empty.data);

      // Verify
      expect(invalid.error?.name).toBe("ArgumentsNotValid");
      expect(missingState.error?.name).toBe("ArgumentsNotValid");
      expect(state.data).toEqual({ content: {}, revision: 1 });
    });

    it("checks revision atomically and rejects invalid writes", async () => {
      // Setup SUT
      const { backend } = deps();
      const created = await backend.apps.create(definition);
      assert(created.success);
      // Exercise
      const results = await Promise.all([
        update(backend, created.data, 1, { count: 1 }),
        update(backend, created.data, 1, { count: 2 }),
      ]);
      const staleRevision = await update(backend, created.data, 1, {
        count: 3,
      });
      const invalid = await update(backend, created.data, 2, {
        count: "wrong",
      });
      const saved = await read(backend, created.data);
      // Verify
      expect(results.filter((result) => result.success)).toHaveLength(1);
      expect(results.find((result) => !result.success)?.error).toMatchObject({
        name: "UnexpectedError",
        details: {
          cause: {
            message: expect.stringMatching(
              /transaction aborted|database is locked/i,
            ),
          },
        },
      });
      expect(staleRevision.error).toEqual({
        name: "AppStateRevisionNotMatching",
        details: {
          appId: created.data.id,
          latestRevision: 2,
          suppliedRevision: 1,
        },
      });
      expect(invalid.error).toEqual({
        name: "AppStateContentNotValid",
        details: {
          appId: created.data.id,
          issues: [
            expect.objectContaining({
              message: expect.any(String),
              path: [{ key: "count" }],
            }),
          ],
        },
      });
      expect(saved.data?.revision).toBe(2);
    });

    it("coordinates concurrent migration and state writes without losing a successful write", async () => {
      // Setup SUT
      const { backend } = deps();
      const created = await backend.apps.create(definition);
      assert(created.success);
      // Exercise
      const [version, write] = await Promise.all([
        backend.apps.createNewVersion(
          created.data.id,
          created.data.latestVersion.id,
          [],
          definition.files,
          created.data.latestVersion.permissions,
          {
            ...definition.stateDefinition!,
            migration: {
              source: "",
              compiled:
                "export default (previous) => ({ count: previous.count + 5 });",
            },
          },
        ),
        update(backend, created.data, 1, { count: 10 }),
      ]);
      const state = await read(
        backend,
        version.success ? version.data : created.data,
      );
      // Verify
      expect([version, write].filter((result) => result.success)).toHaveLength(
        1,
      );
      expect(
        [version, write].find((result) => !result.success)?.error,
      ).toMatchObject({
        name: "UnexpectedError",
        details: {
          cause: {
            message: expect.stringMatching(
              /transaction aborted|database is locked/i,
            ),
          },
        },
      });
      expect(state.data).toEqual({
        content: { count: write.success ? 10 : 5 },
        revision: 2,
      });
    });

    it("migrates atomically and rejects obsolete app versions", async () => {
      // Setup SUT
      const { backend } = deps();
      const created = await backend.apps.create(definition);
      assert(created.success);
      const nextSchema: Schema = {
        types: {
          State: {
            dataType: DataType.Struct,
            properties: { total: { dataType: DataType.Number } },
          },
        },
        rootType: "State",
      };
      const stateDefinition = {
        migration: null,
        schema: nextSchema,
        initialState: { total: 0 },
      };
      // Exercise
      const missingMigration = await backend.apps.createNewVersion(
        created.data.id,
        created.data.latestVersion.id,
        [],
        definition.files,
        created.data.latestVersion.permissions,
        stateDefinition,
      );
      const failedMigration = await backend.apps.createNewVersion(
        created.data.id,
        created.data.latestVersion.id,
        [],
        definition.files,
        created.data.latestVersion.permissions,
        {
          ...stateDefinition,
          migration: {
            source: "",
            compiled: "export default () => { throw new Error('failure'); };",
          },
        },
      );
      const unchanged = await read(backend, created.data);
      const version = await backend.apps.createNewVersion(
        created.data.id,
        created.data.latestVersion.id,
        [],
        definition.files,
        created.data.latestVersion.permissions,
        {
          ...stateDefinition,
          migration: {
            source: "",
            compiled:
              "export default (previous) => ({ total: previous.count + 5 });",
          },
        },
      );
      assert(version.success);
      const obsolete = await update(backend, created.data, 1, { count: 9 });
      // Verify
      expect(missingMigration.error).toEqual({
        name: "AppStateMigrationRequired",
        details: {
          appId: created.data.id,
          issues: expect.arrayContaining([
            expect.objectContaining({
              message: expect.any(String),
              path: [{ key: "total" }],
            }),
          ]),
        },
      });
      expect(failedMigration.error).toEqual({
        name: "AppStateMigrationFailed",
        details: {
          appId: created.data.id,
          cause: {
            name: "ExecutingTypescriptFunctionFailed",
            details: expect.objectContaining({ message: "failure" }),
          },
        },
      });
      expect(unchanged.data?.content).toEqual({ count: 0 });
      expect((await read(backend, version.data)).data).toEqual({
        content: { total: 5 },
        revision: 2,
      });
      expect(obsolete.error).toEqual({
        name: "AppVersionIdNotMatching",
        details: {
          appId: created.data.id,
          latestVersionId: version.data.latestVersion.id,
          suppliedVersionId: created.data.latestVersion.id,
        },
      });
    });

    it("allows semantic migrations and guards concurrent app version creation", async () => {
      // Setup SUT
      const { backend } = deps();
      const created = await backend.apps.create(definition);
      assert(created.success);
      // Exercise
      const saved = await update(backend, created.data, 1, { count: 8 });
      const version = await backend.apps.createNewVersion(
        created.data.id,
        created.data.latestVersion.id,
        [],
        definition.files,
        { modals: false, downloads: false, http: { allowedOrigins: [] } },
        {
          ...definition.stateDefinition!,
          migration: {
            source: "",
            compiled:
              "export default (previous) => ({ count: previous.count * 2 });",
          },
        },
      );
      assert(version.success);
      const staleVersion = await backend.apps.createNewVersion(
        created.data.id,
        created.data.latestVersion.id,
        [],
        definition.files,
        created.data.latestVersion.permissions,
        { ...created.data.latestVersion.stateDefinition, migration: null },
      );
      const obsolete = await update(backend, created.data, 2, { count: 9 });
      // Verify
      expect(saved.success).toBe(true);
      expect((await read(backend, version.data)).data?.content).toEqual({
        count: 16,
      });
      expect(staleVersion.error).toEqual({
        name: "AppVersionIdNotMatching",
        details: {
          appId: created.data.id,
          latestVersionId: version.data.latestVersion.id,
          suppliedVersionId: created.data.latestVersion.id,
        },
      });
      expect(obsolete.error).toEqual({
        name: "AppVersionIdNotMatching",
        details: {
          appId: created.data.id,
          latestVersionId: version.data.latestVersion.id,
          suppliedVersionId: created.data.latestVersion.id,
        },
      });
      expect(version.data.latestVersion.permissions).toEqual(
        defaultAppPermissions,
      );
    });

    it("preserves empty state across code-only updates and rejects stale versions", async () => {
      // Setup SUT
      const { backend } = deps();
      const created = await backend.apps.create({
        ...definition,
        stateDefinition: emptyAppStateDefinition,
      });
      assert(created.success);
      const version = await backend.apps.createNewVersion(
        created.data.id,
        created.data.latestVersion.id,
        [],
        definition.files,
        created.data.latestVersion.permissions,
        { ...created.data.latestVersion.stateDefinition, migration: null },
      );
      assert(version.success);

      // Exercise
      const conflict = await backend.apps.createNewVersion(
        created.data.id,
        created.data.latestVersion.id,
        [],
        definition.files,
        created.data.latestVersion.permissions,
        { ...created.data.latestVersion.stateDefinition, migration: null },
      );
      const saved = await update(backend, version.data, 1, {});

      // Verify
      expect(conflict.error).toEqual({
        name: "AppVersionIdNotMatching",
        details: {
          appId: created.data.id,
          latestVersionId: version.data.latestVersion.id,
          suppliedVersionId: created.data.latestVersion.id,
        },
      });
      expect(saved.data).toEqual({ content: {}, revision: 2 });
    });

    it("rejects state reads and writes from stale app versions", async () => {
      // Setup SUT
      const { backend } = deps();
      const created = await backend.apps.create(definition);
      assert(created.success);
      const version = await backend.apps.createNewVersion(
        created.data.id,
        created.data.latestVersion.id,
        [],
        definition.files,
        created.data.latestVersion.permissions,
        { ...created.data.latestVersion.stateDefinition, migration: null },
      );
      assert(version.success);

      // Exercise
      const staleRead = await read(backend, created.data);
      const staleWrite = await update(backend, created.data, 1, { count: 1 });

      // Verify
      expect(staleRead.error).toEqual({
        name: "AppVersionIdNotMatching",
        details: {
          appId: created.data.id,
          latestVersionId: version.data.latestVersion.id,
          suppliedVersionId: created.data.latestVersion.id,
        },
      });
      expect(staleWrite.error).toEqual(staleRead.error);
      expect((await read(backend, version.data)).data?.revision).toBe(1);
    });

    it("returns content validation issues for initialization and preserves existing state after invalid updates", async () => {
      // Setup SUT
      const { backend } = deps();
      const created = await backend.apps.create(definition);
      assert(created.success);
      const invalidState = {
        ...definition.stateDefinition!,
        initialState: { count: "invalid" },
      };

      // Exercise
      const invalidCreation = await backend.apps.create({
        ...definition,
        stateDefinition: invalidState,
      });
      const invalidVersion = await backend.apps.createNewVersion(
        created.data.id,
        created.data.latestVersion.id,
        [],
        definition.files,
        created.data.latestVersion.permissions,
        invalidState,
      );
      const invalidWrite = await update(backend, created.data, 1, {
        count: Number.NaN,
      });
      const saved = await read(backend, created.data);

      // Verify
      expect(invalidCreation.error).toEqual({
        name: "AppStateContentNotValid",
        details: {
          appId: null,
          issues: [
            expect.objectContaining({
              message: expect.any(String),
              path: [{ key: "count" }],
            }),
          ],
        },
      });
      expect(invalidVersion.error).toEqual({
        name: "AppStateContentNotValid",
        details: {
          appId: created.data.id,
          issues: [
            expect.objectContaining({
              message: expect.any(String),
              path: [{ key: "count" }],
            }),
          ],
        },
      });
      expect(invalidWrite.error).toEqual({
        name: "AppStateContentNotValid",
        details: {
          appId: created.data.id,
          issues: [
            expect.objectContaining({
              message: "Invalid JSON value: not JSON-invariant",
            }),
          ],
        },
      });
      expect(saved.data).toEqual({
        content: { count: 0 },
        revision: 1,
      });
    });

    it.each([
      { name: "undefined", content: () => ({ count: undefined }) },
      { name: "infinity", content: () => ({ count: Infinity }) },
      { name: "Date", content: () => ({ count: new Date() }) },
      {
        name: "cycle",
        content: () => {
          const content: Record<string, unknown> = {};
          content["count"] = content;
          return content;
        },
      },
    ])(
      "returns a domain error for $name state during creation, versioning and updates",
      async ({ content }) => {
        // Setup SUT
        const { backend } = deps();
        const created = await backend.apps.create(definition);
        assert(created.success);
        const invalidStateDefinition = {
          ...definition.stateDefinition,
          initialState: content(),
        };

        // Exercise
        const invalidCreation = await backend.apps.create({
          ...definition,
          stateDefinition: invalidStateDefinition,
        });
        const invalidVersion = await backend.apps.createNewVersion(
          created.data.id,
          created.data.latestVersion.id,
          [],
          definition.files,
          created.data.latestVersion.permissions,
          invalidStateDefinition,
        );
        const invalidWrite = await update(backend, created.data, 1, content());
        const saved = await read(backend, created.data);
        const apps = await backend.apps.list();

        // Verify
        for (const result of [invalidCreation, invalidVersion, invalidWrite]) {
          expect(result.error).toEqual({
            name: "AppStateContentNotValid",
            details: {
              appId: result === invalidCreation ? null : created.data.id,
              issues: [
                expect.objectContaining({
                  message: "Invalid JSON value: not JSON-invariant",
                }),
              ],
            },
          });
        }
        expect(saved.data).toEqual({ content: { count: 0 }, revision: 1 });
        expect(apps.data).toEqual([created.data]);
      },
    );

    it.each([null, 42, "invalid", []].map((content) => ({ content })))(
      "rejects non-object state content through schema validation: %j",
      async ({ content }) => {
        // Setup SUT
        const { backend } = deps();
        const created = await backend.apps.create(definition);
        assert(created.success);

        // Exercise
        const invalidCreation = await backend.apps.create({
          ...definition,
          stateDefinition: {
            ...definition.stateDefinition,
            initialState: content,
          },
        });
        const invalidWrite = await update(backend, created.data, 1, content);
        const saved = await read(backend, created.data);

        // Verify
        expect(invalidCreation.error?.name).toBe("AppStateContentNotValid");
        expect(invalidWrite.error?.name).toBe("AppStateContentNotValid");
        expect(saved.data).toEqual({ content: { count: 0 }, revision: 1 });
      },
    );

    it("distinguishes invalid migration modules from invalid migration output and rolls back both", async () => {
      // Setup SUT
      const { backend } = deps();
      const created = await backend.apps.create(definition);
      assert(created.success);

      // Exercise
      const invalidModule = await backend.apps.createNewVersion(
        created.data.id,
        created.data.latestVersion.id,
        [],
        definition.files,
        created.data.latestVersion.permissions,
        {
          ...definition.stateDefinition!,
          migration: { source: "", compiled: "export default 42;" },
        },
      );
      const invalidOutput = await backend.apps.createNewVersion(
        created.data.id,
        created.data.latestVersion.id,
        [],
        definition.files,
        created.data.latestVersion.permissions,
        {
          ...definition.stateDefinition!,
          migration: {
            source: "",
            compiled: 'export default () => ({ count: "invalid" });',
          },
        },
      );
      const saved = await read(backend, created.data);
      const apps = await backend.apps.list();

      // Verify
      expect(invalidModule.error).toEqual({
        name: "AppStateMigrationNotValid",
        details: {
          appId: created.data.id,
          issues: [
            {
              message:
                "The default export of the migration TypescriptModule is not a function",
            },
          ],
        },
      });
      expect(invalidOutput.error).toEqual({
        name: "AppStateMigrationFailed",
        details: {
          appId: created.data.id,
          cause: {
            name: "AppStateContentNotValid",
            details: {
              appId: created.data.id,
              issues: [
                expect.objectContaining({
                  message: expect.any(String),
                  path: [{ key: "count" }],
                }),
              ],
            },
          },
        },
      });
      expect(saved.data).toEqual({
        content: { count: 0 },
        revision: 1,
      });
      expect(
        apps.data?.find((app) => app.id === created.data.id)?.latestVersion.id,
      ).toBe(created.data.latestVersion.id);
    });

    it("migrates empty state, preserves compatible content, isolates apps and deletes state", async () => {
      // Setup SUT
      const { backend } = deps();
      const legacy = await backend.apps.create({
        ...definition,
        stateDefinition: emptyAppStateDefinition,
      });
      const other = await backend.apps.create(definition);
      assert(legacy.success && other.success);
      // Exercise
      const initialized = await backend.apps.createNewVersion(
        legacy.data.id,
        legacy.data.latestVersion.id,
        [],
        definition.files,
        legacy.data.latestVersion.permissions,
        {
          ...definition.stateDefinition,
          migration: {
            source: "",
            compiled: "export default () => ({ count: 0 });",
          },
        },
      );
      assert(initialized.success);
      await update(backend, initialized.data, 2, { count: 7 });
      const compatible = await backend.apps.createNewVersion(
        initialized.data.id,
        initialized.data.latestVersion.id,
        [],
        definition.files,
        initialized.data.latestVersion.permissions,
        {
          migration: null,
          schema: {
            ...schema,
            types: {
              State: {
                ...schema.types["State"]!,
                description: "Compatible description update",
              },
            },
          },
          initialState: { count: 99 },
        },
      );
      assert(compatible.success);
      const saved = await read(backend, compatible.data);
      await backend.apps.delete(compatible.data.id, "delete");
      // Verify
      expect(saved.data?.content).toEqual({ count: 7 });
      expect((await read(backend, other.data)).data?.content).toEqual({
        count: 0,
      });
      expect((await read(backend, compatible.data)).error?.name).toBe(
        "AppNotFound",
      );
    });

    it("requires a definition and migrates populated state back to an empty object", async () => {
      // Setup SUT
      const { backend } = deps();
      const created = await backend.apps.create(definition);
      assert(created.success);

      // Exercise
      const removed = await backend.apps.createNewVersion(
        created.data.id,
        created.data.latestVersion.id,
        [],
        definition.files,
        created.data.latestVersion.permissions,
        null as any,
      );
      const missingMigration = await backend.apps.createNewVersion(
        created.data.id,
        created.data.latestVersion.id,
        [],
        definition.files,
        created.data.latestVersion.permissions,
        emptyAppStateDefinition,
      );
      const emptied = await backend.apps.createNewVersion(
        created.data.id,
        created.data.latestVersion.id,
        [],
        definition.files,
        created.data.latestVersion.permissions,
        {
          ...emptyAppStateDefinition,
          migration: { source: "", compiled: "export default () => ({});" },
        },
      );
      assert(emptied.success);
      const state = await read(backend, emptied.data);
      const invalidWrite = await update(backend, emptied.data, 2, { count: 5 });

      // Verify
      expect(removed.error?.name).toBe("ArgumentsNotValid");
      expect(missingMigration.error?.name).toBe("AppStateMigrationRequired");
      expect(state.data).toEqual({ content: {}, revision: 2 });
      expect(emptied.data.latestVersion.stateDefinition.schema).toEqual(
        emptyAppStateDefinition.schema,
      );
      expect(invalidWrite.error?.name).toBe("AppStateContentNotValid");
    });

    it.each([DataType.File, DataType.DocumentRef] as const)(
      "rejects unsupported named and nested state type %s",
      async (dataType) => {
        // Setup SUT
        const { backend } = deps();
        // Exercise
        const result = await backend.apps.create({
          ...definition,
          stateDefinition: {
            migration: null,
            schema: {
              ...schema,
              types: {
                ...schema.types,
                Hidden: { dataType: DataType.List, items: { dataType } },
              },
            },
            initialState: { count: 0 },
          },
        });
        // Verify
        expect(result.error).toEqual({
          name: "AppStateSchemaNotValid",
          details: {
            appId: null,
            issues: expect.arrayContaining([
              expect.objectContaining({
                message: "App state cannot contain File or DocumentRef types.",
              }),
            ]),
          },
        });
      },
    );
  });
});

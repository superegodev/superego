import {
  type AppDefinition,
  type AppHttpRequest,
  type App,
  type Backend,
  AppType,
} from "@superego/backend";
import type { HttpExecutor } from "@superego/executing-backend";
import { type Schema, DataType } from "@superego/schema";
import {
  appHttpFailure,
  makeSuccessfulResult,
  Id,
} from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it, vi } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("Apps", (deps) => {
  describe("requestHttp", () => {
    const origin = "https://example.com";
    const response = {
      status: 500,
      headers: [["Content-Type", "application/octet-stream"]] as [
        string,
        string,
      ][],
      body: { encoding: "base64" as const, data: "AP+A" },
      url: `${origin}/service`,
    };

    it("executes HTTP without a transaction and keeps other usecases transactional", async () => {
      // Setup mocks
      const execute = vi
        .fn<HttpExecutor["execute"]>()
        .mockResolvedValue(makeSuccessfulResult(response));
      // Setup SUT
      const { backend, dataRepositoriesManager } = deps({
        httpExecutor: { execute },
      });
      const transaction = vi.spyOn(
        dataRepositoriesManager,
        "runInSerializableTransaction",
      );
      const request: AppHttpRequest = {
        url: `${origin}/service`,
        method: "post",
        headers: [["Authorization", "Bearer supplied"]],
        body: { encoding: "base64", data: "AP+A" },
      };
      // Exercise
      const result = await backend.apps.requestHttp(request, [
        "https://EXAMPLE.com:443/",
      ]);
      // Verify
      expect(result).toEqual(makeSuccessfulResult(response));
      expect(execute).toHaveBeenCalledExactlyOnceWith(
        { ...request, method: "POST" },
        [origin],
      );
      expect(transaction).not.toHaveBeenCalled();
      // Exercise
      const apps = await backend.apps.list();
      // Verify
      expect(apps.success).toBe(true);
      expect(transaction).toHaveBeenCalledOnce();
    });

    it.each([
      [{ url: "file:///secret" }, [origin]],
      [{ url: origin, method: "CONNECT" }, [origin]],
      [{ url: origin, headers: [["Host", "other.example"]] }, [origin]],
      [{ url: origin, allowedOrigins: [origin] }, []],
      [
        { url: origin, body: { encoding: "base64", data: "invalid" } },
        [origin],
      ],
      [{ url: origin }, ["https://*.example.com"]],
      [{ url: origin }, ["https://example.com/path"]],
    ])(
      "validates arguments without opening a transaction: %j, %j",
      async (request, allowedOrigins) => {
        // Setup mocks
        const execute = vi.fn<HttpExecutor["execute"]>();
        // Setup SUT
        const { backend, dataRepositoriesManager } = deps({
          httpExecutor: { execute },
        });
        const transaction = vi.spyOn(
          dataRepositoriesManager,
          "runInSerializableTransaction",
        );
        // Exercise
        const result = await backend.apps.requestHttp(
          request as AppHttpRequest,
          allowedOrigins,
        );
        // Verify
        expect(result.error?.name).toBe("ArgumentsNotValid");
        expect(execute).not.toHaveBeenCalled();
        expect(transaction).not.toHaveBeenCalled();
      },
    );

    it.each([
      { allowedOrigins: [] },
      { allowedOrigins: ["https://example.com:8443"] },
      { allowedOrigins: ["https://other.example.com"] },
    ])(
      "rejects destinations missing from the host's origins: $allowedOrigins",
      async ({ allowedOrigins }) => {
        // Setup mocks
        const execute = vi.fn<HttpExecutor["execute"]>();
        // Setup SUT
        const { backend } = deps({ httpExecutor: { execute } });
        // Exercise
        const result = await backend.apps.requestHttp(
          { url: origin },
          allowedOrigins,
        );
        // Verify
        expect(result).toEqual(appHttpFailure("DestinationDenied"));
        expect(execute).not.toHaveBeenCalled();
      },
    );

    it("validates executor results without a transaction", async () => {
      // Setup mocks
      const execute = vi
        .fn<HttpExecutor["execute"]>()
        .mockResolvedValue(
          makeSuccessfulResult({ ...response, status: "invalid" }) as any,
        );
      // Setup SUT
      const { backend, dataRepositoriesManager } = deps({
        httpExecutor: { execute },
      });
      const transaction = vi.spyOn(
        dataRepositoriesManager,
        "runInSerializableTransaction",
      );
      // Exercise
      const result = await backend.apps.requestHttp({ url: origin }, [origin]);
      // Verify
      expect(result.error).toMatchObject({
        name: "UnexpectedError",
        details: { cause: { reason: "ResultValidationFailed" } },
      });
      expect(transaction).not.toHaveBeenCalled();
    });

    it("returns executor policy errors unchanged", async () => {
      // Setup mocks
      const execute = vi
        .fn<HttpExecutor["execute"]>()
        .mockResolvedValue(appHttpFailure("DestinationDenied"));
      // Setup SUT
      const { backend } = deps({ httpExecutor: { execute } });
      // Exercise
      const result = await backend.apps.requestHttp({ url: origin }, [origin]);
      // Verify
      expect(result).toEqual(appHttpFailure("DestinationDenied"));
    });

    it("sanitizes executor exceptions and never retries HTTP requests", async () => {
      // Setup mocks
      const execute = vi
        .fn<HttpExecutor["execute"]>()
        .mockRejectedValue(new Error("SQLITE_BUSY: secret-url?token=secret"));
      // Setup SUT
      const { backend, dataRepositoriesManager } = deps({
        httpExecutor: { execute },
      });
      const transaction = vi.spyOn(
        dataRepositoriesManager,
        "runInSerializableTransaction",
      );
      // Exercise
      const result = await backend.apps.requestHttp({ url: origin }, [origin]);
      // Verify
      expect(result).toEqual(appHttpFailure("TransportFailure"));
      expect(execute).toHaveBeenCalledOnce();
      expect(transaction).not.toHaveBeenCalled();
    });
  });

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
        Id.generate.appVersion(),
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
      const result = await backend.apps.createNewVersion(
        appId,
        Id.generate.appVersion(),
        [],
        {
          "/main.tsx": { source: "", compiled: "" },
        },
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
        createAppResult.data.latestVersion.id,
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
      state: { schema, initialState: { count: 0 } },
      permissions: {
        modals: true,
        http: { allowedOrigins: ["https://EXAMPLE.com:443/"] },
      },
    };
    const read = (backend: Backend, app: App) =>
      backend.apps.getState(
        app.id,
        app.latestVersion.id,
        app.latestVersion.stateSchemaId ?? null,
      );
    const update = (
      backend: Backend,
      app: App,
      revision: number,
      content: Record<string, unknown>,
    ) =>
      backend.apps.updateState(
        app.id,
        app.latestVersion.id,
        app.latestVersion.stateSchemaId ?? null,
        revision,
        content,
      );

    it("normalizes permissions, initializes once, preserves state and permissions on code updates", async () => {
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
      );
      assert(version.success);
      const after = await read(backend, version.data);
      // Verify
      expect(initial.data.content).toEqual({ count: 0 });
      expect(
        created.data.latestVersion.permissions?.http?.allowedOrigins,
      ).toEqual(["https://example.com"]);
      expect(saved.success).toBe(true);
      expect(after).toEqual(saved);
      expect(version.data.latestVersion.stateSchemaId).toBe(
        created.data.latestVersion.stateSchemaId,
      );
      expect(version.data.latestVersion.permissions).toEqual(
        created.data.latestVersion.permissions,
      );
      expect(created.data).not.toHaveProperty("state");
    });

    it("rejects unknown capabilities and reports state-not-defined for legacy apps", async () => {
      // Setup SUT
      const { backend } = deps();
      // Exercise
      const invalid = await backend.apps.create({
        ...definition,
        permissions: { sandbox: ["allow-top-navigation"] },
      } as any);
      const legacy = await backend.apps.create({
        ...definition,
        state: undefined,
        permissions: undefined,
      });
      assert(legacy.success);
      const state = await read(backend, legacy.data);
      // Verify
      expect(invalid.error?.name).toBe("ArgumentsNotValid");
      expect(state.error).toEqual({
        name: "AppStateError",
        details: { reason: "StateNotDefined" },
      });
      expect(legacy.data.latestVersion.permissions).toBeUndefined();
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
      const invalid = await update(backend, created.data, 2, {
        count: "wrong",
      });
      const saved = await read(backend, created.data);
      // Verify
      expect(results.filter((result) => result.success)).toHaveLength(1);
      expect(results.find((result) => !result.success)?.error).toEqual({
        name: "AppStateError",
        details: { reason: "RevisionConflict" },
      });
      expect(invalid.error).toEqual({
        name: "AppStateError",
        details: { reason: "ContentNotValid" },
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
          {
            state: {
              ...definition.state!,
              migration: {
                source: "",
                compiled:
                  "export default (previous) => ({ count: previous.count + 5 });",
              },
            },
          },
        ),
        update(backend, created.data, 1, { count: 10 }),
      ]);
      assert(version.success);
      const state = await read(backend, version.data);
      // Verify
      expect(state.data?.content).toEqual({ count: write.success ? 15 : 5 });
      expect(state.data?.revision).toBe(write.success ? 3 : 2);
      if (!write.success) {
        expect(write.error).toEqual({
          name: "AppStateError",
          details: { reason: "ObsoleteSchema" },
        });
      }
    });

    it("migrates atomically, rejects obsolete contexts and never removes state", async () => {
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
      const state = { schema: nextSchema, initialState: { total: 0 } };
      // Exercise
      const missingMigration = await backend.apps.createNewVersion(
        created.data.id,
        created.data.latestVersion.id,
        [],
        definition.files,
        { state },
      );
      const failedMigration = await backend.apps.createNewVersion(
        created.data.id,
        created.data.latestVersion.id,
        [],
        definition.files,
        {
          state: {
            ...state,
            migration: {
              source: "",
              compiled: "export default () => { throw new Error('failure'); };",
            },
          },
        },
      );
      const unchanged = await read(backend, created.data);
      const version = await backend.apps.createNewVersion(
        created.data.id,
        created.data.latestVersion.id,
        [],
        definition.files,
        {
          state: {
            ...state,
            migration: {
              source: "",
              compiled:
                "export default (previous) => ({ total: previous.count + 5 });",
            },
          },
        },
      );
      assert(version.success);
      const obsolete = await update(backend, created.data, 1, { count: 9 });
      const removal = await backend.apps.createNewVersion(
        version.data.id,
        version.data.latestVersion.id,
        [],
        definition.files,
        { state: null },
      );
      // Verify
      expect(missingMigration.error).toEqual({
        name: "AppStateError",
        details: { reason: "MigrationRequired" },
      });
      expect(failedMigration.error).toEqual({
        name: "AppStateError",
        details: { reason: "MigrationFailed" },
      });
      expect(unchanged.data?.content).toEqual({ count: 0 });
      expect((await read(backend, version.data)).data).toEqual({
        content: { total: 5 },
        revision: 2,
        schemaId: version.data.latestVersion.id,
      });
      expect(obsolete.error).toEqual({
        name: "AppStateError",
        details: { reason: "ObsoleteSchema" },
      });
      expect(removal.error).toEqual({
        name: "AppStateError",
        details: { reason: "SchemaRemovalNotAllowed" },
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
        {
          permissions: {},
          state: {
            ...definition.state!,
            migration: {
              source: "",
              compiled:
                "export default (previous) => ({ count: previous.count * 2 });",
            },
          },
        },
      );
      assert(version.success);
      const staleVersion = await backend.apps.createNewVersion(
        created.data.id,
        created.data.latestVersion.id,
        [],
        definition.files,
      );
      const obsolete = await update(backend, created.data, 2, { count: 9 });
      // Verify
      expect(saved.success).toBe(true);
      expect((await read(backend, version.data)).data?.content).toEqual({
        count: 16,
      });
      expect(staleVersion.error).toEqual({
        name: "AppStateError",
        details: { reason: "ObsoleteVersion" },
      });
      expect(obsolete.error?.name).toBe("AppStateError");
      expect(version.data.latestVersion.permissions).toEqual({});
    });

    it("initializes existing apps, preserves compatible content, isolates apps and deletes state", async () => {
      // Setup SUT
      const { backend } = deps();
      const legacy = await backend.apps.create({
        ...definition,
        state: undefined,
      });
      const other = await backend.apps.create(definition);
      assert(legacy.success && other.success);
      // Exercise
      const initialized = await backend.apps.createNewVersion(
        legacy.data.id,
        legacy.data.latestVersion.id,
        [],
        definition.files,
        { state: definition.state },
      );
      assert(initialized.success);
      await update(backend, initialized.data, 1, { count: 7 });
      const compatible = await backend.apps.createNewVersion(
        initialized.data.id,
        initialized.data.latestVersion.id,
        [],
        definition.files,
        {
          state: {
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
        },
      );
      assert(compatible.success);
      const saved = await read(backend, compatible.data);
      await backend.apps.delete(compatible.data.id, "delete");
      // Verify
      expect(saved.data?.content).toEqual({ count: 7 });
      expect(saved.data?.schemaId).toBe(compatible.data.latestVersion.id);
      expect((await read(backend, other.data)).data?.content).toEqual({
        count: 0,
      });
      expect((await read(backend, compatible.data)).error?.name).toBe(
        "AppNotFound",
      );
    });

    it.each([DataType.File, DataType.DocumentRef] as const)(
      "rejects unsupported named and nested state type %s",
      async (dataType) => {
        // Setup SUT
        const { backend } = deps();
        // Exercise
        const result = await backend.apps.create({
          ...definition,
          state: {
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
          name: "AppStateError",
          details: { reason: "SchemaNotValid" },
        });
      },
    );
  });
});

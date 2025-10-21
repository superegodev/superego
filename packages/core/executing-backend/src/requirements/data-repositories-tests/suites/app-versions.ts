import type { AppVersionEntity } from "@superego/executing-backend";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

const appVersionFiles: AppVersionEntity["files"] = {
  "/main.tsx": {
    source: "export default function App() { return null; }",
    compiled: "export default function App() { return null; }",
  },
};

const targetCollections: AppVersionEntity["targetCollections"] = [
  {
    id: Id.generate.collection(),
    versionId: Id.generate.collectionVersion(),
  },
];

export default rd<GetDependencies>("App versions", (deps) => {
  it("inserting", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();

    // Exercise
    const appVersion: AppVersionEntity = {
      id: Id.generate.appVersion(),
      previousVersionId: null,
      appId: Id.generate.app(),
      targetCollections: targetCollections,
      files: appVersionFiles,
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.appVersion.insert(appVersion);
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.appVersion.findLatestWhereAppIdEq(
          appVersion.appId,
        ),
      }),
    );
    expect(found).toEqual(appVersion);
  });

  describe("finding latest by app id", () => {
    it("case: exists => returns latest version", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const appId = Id.generate.app();
      const appVersion1: AppVersionEntity = {
        id: Id.generate.appVersion(),
        previousVersionId: null,
        appId,
        targetCollections: targetCollections,
        files: appVersionFiles,
        createdAt: new Date(),
      };
      const appVersion2: AppVersionEntity = {
        id: Id.generate.appVersion(),
        previousVersionId: appVersion1.id,
        appId,
        targetCollections: targetCollections,
        files: appVersionFiles,
        createdAt: new Date(appVersion1.createdAt.getTime() + 1),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.appVersion.insert(appVersion1);
          await repos.appVersion.insert(appVersion2);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.appVersion.findLatestWhereAppIdEq(appId),
        }),
      );

      // Verify
      expect(found).toEqual(appVersion2);
    });

    it("case: doesn't exist => returns null", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.appVersion.findLatestWhereAppIdEq(
            Id.generate.app(),
          ),
        }),
      );

      // Verify
      expect(found).toEqual(null);
    });
  });

  it("deleting all by app id", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();
    const app1Id = Id.generate.app();
    const app2Id = Id.generate.app();
    const appVersion1: AppVersionEntity = {
      id: Id.generate.appVersion(),
      previousVersionId: null,
      appId: app1Id,
      targetCollections: targetCollections,
      files: appVersionFiles,
      createdAt: new Date(),
    };
    const appVersion2: AppVersionEntity = {
      id: Id.generate.appVersion(),
      previousVersionId: appVersion1.id,
      appId: app1Id,
      targetCollections: targetCollections,
      files: appVersionFiles,
      createdAt: new Date(),
    };
    const appVersion3: AppVersionEntity = {
      id: Id.generate.appVersion(),
      previousVersionId: null,
      appId: app2Id,
      targetCollections: targetCollections,
      files: appVersionFiles,
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.appVersion.insert(appVersion1);
        await repos.appVersion.insert(appVersion2);
        await repos.appVersion.insert(appVersion3);
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const deletedIds =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.appVersion.deleteAllWhereAppIdEq(app1Id),
        }),
      );

    // Verify
    expect(deletedIds).toEqual([appVersion1.id, appVersion2.id]);
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.appVersion.findAllLatests(),
      }),
    );
    expect(found).toEqual([appVersion3]);
  });

  describe("finding all latests", () => {
    it("case: no app versions => returns empty array", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.appVersion.findAllLatests(),
        }),
      );

      // Verify
      expect(found).toEqual([]);
    });

    it("case: some app versions => returns latest from each app", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const app1Id = Id.generate.app();
      const app2Id = Id.generate.app();
      const appVersion1: AppVersionEntity = {
        id: Id.generate.appVersion(),
        previousVersionId: null,
        appId: app1Id,
        targetCollections: targetCollections,
        files: appVersionFiles,
        createdAt: new Date(),
      };
      const appVersion2: AppVersionEntity = {
        id: Id.generate.appVersion(),
        previousVersionId: appVersion1.id,
        appId: app1Id,
        targetCollections: targetCollections,
        files: appVersionFiles,
        createdAt: new Date(),
      };
      const appVersion3: AppVersionEntity = {
        id: Id.generate.appVersion(),
        previousVersionId: null,
        appId: app2Id,
        targetCollections: targetCollections,
        files: appVersionFiles,
        createdAt: new Date(),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.appVersion.insert(appVersion1);
          await repos.appVersion.insert(appVersion2);
          await repos.appVersion.insert(appVersion3);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.appVersion.findAllLatests(),
        }),
      );

      // Verify
      expect(found).toEqual([appVersion2, appVersion3]);
    });
  });
});

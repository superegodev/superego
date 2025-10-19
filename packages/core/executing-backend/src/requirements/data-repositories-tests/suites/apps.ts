import { AppType } from "@superego/backend";
import type { AppEntity } from "@superego/executing-backend";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("Apps", (deps) => {
  it("inserting", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();

    // Exercise
    const app: AppEntity = {
      id: Id.generate.app(),
      type: AppType.CollectionView,
      name: "name",
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.app.insert(app);
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.app.find(app.id),
      }),
    );
    expect(found).toEqual(app);
  });

  it("replacing", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();
    const app: AppEntity = {
      id: Id.generate.app(),
      type: AppType.CollectionView,
      name: "original name",
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.app.insert(app);
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const updatedApp: AppEntity = { ...app, name: "updated name" };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.app.replace(updatedApp);
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.app.find(app.id),
      }),
    );
    expect(found).toEqual(updatedApp);
  });

  it("deleting", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();
    const app: AppEntity = {
      id: Id.generate.app(),
      type: AppType.CollectionView,
      name: "name",
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.app.insert(app);
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const deletedId =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.app.delete(app.id),
        }),
      );

    // Verify
    expect(deletedId).toEqual(app.id);
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.app.find(app.id),
      }),
    );
    expect(found).toEqual(null);
  });

  describe("finding all", () => {
    it("case: no apps => returns empty array", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.app.findAll(),
        }),
      );

      // Verify
      expect(found).toEqual([]);
    });

    it("case: some apps => returns them, sorted by name", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const app1: AppEntity = {
        id: Id.generate.app(),
        type: AppType.CollectionView,
        name: "name 1",
        createdAt: new Date(),
      };
      const app2: AppEntity = {
        id: Id.generate.app(),
        type: AppType.CollectionView,
        name: "name 2",
        createdAt: new Date(),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.app.insert(app2);
          await repos.app.insert(app1);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.app.findAll(),
        }),
      );

      // Verify
      expect(found).toEqual([app1, app2]);
    });
  });
});

import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect, it } from "vitest";
import type Dependencies from "../Dependencies.js";

export default rd<Dependencies>("Collections", (deps) => {
  it("inserting", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();

    // Exercise
    const collection = {
      id: Id.generate.collection(),
      settings: {
        name: "name",
        icon: null,
        collectionCategoryId: null,
      },
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.collection.insert(collection);
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.collection.find(collection.id),
      }),
    );
    expect(found).toEqual(collection);
  });

  it("replacing", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();
    const collection = {
      id: Id.generate.collection(),
      settings: {
        name: "original name",
        icon: null,
        collectionCategoryId: null,
      },
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.collection.insert(collection);
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const updatedCollection = {
      ...collection,
      settings: {
        ...collection.settings,
        name: "updated name",
      },
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.collection.replace(updatedCollection);
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.collection.find(collection.id),
      }),
    );
    expect(found).toEqual(updatedCollection);
  });

  it("deleting", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();
    const collection = {
      id: Id.generate.collection(),
      settings: {
        name: "name",
        icon: null,
        collectionCategoryId: null,
      },
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.collection.insert(collection);
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const deletedId =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collection.delete(collection.id),
        }),
      );

    // Verify
    expect(deletedId).toEqual(collection.id);
    const exists = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.collection.exists(collection.id),
      }),
    );
    expect(exists).toEqual(false);
  });

  describe("checking existence", () => {
    it("case: exists", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();
      const collection = {
        id: Id.generate.collection(),
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
        },
        createdAt: new Date(),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.collection.insert(collection);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const exists = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collection.exists(collection.id),
        }),
      );

      // Verify
      expect(exists).toEqual(true);
    });

    it("case: doesn't exist", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();

      // Exercise
      const exists = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collection.exists(Id.generate.collection()),
        }),
      );

      // Verify
      expect(exists).toEqual(false);
    });
  });

  describe("checking existence by collection category", () => {
    it("case: exists", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();
      const collectionCategoryId = Id.generate.collectionCategory();
      const collection = {
        id: Id.generate.collection(),
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: collectionCategoryId,
        },
        createdAt: new Date(),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.collection.insert(collection);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const exists = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.collection.existsWhereSettingsCollectionCategoryIdEq(
              collectionCategoryId,
            ),
        }),
      );

      // Verify
      expect(exists).toEqual(true);
    });

    it("case: doesn't exist", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();

      // Exercise
      const exists = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.collection.existsWhereSettingsCollectionCategoryIdEq(
              Id.generate.collectionCategory(),
            ),
        }),
      );

      // Verify
      expect(exists).toEqual(false);
    });
  });

  describe("finding one", () => {
    it("case: exists => returns it", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();
      const collection = {
        id: Id.generate.collection(),
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
        },
        createdAt: new Date(),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.collection.insert(collection);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collection.find(collection.id),
        }),
      );

      // Verify
      expect(found).toEqual(collection);
    });

    it("case: doesn't exist => returns null", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collection.find(Id.generate.collection()),
        }),
      );

      // Verify
      expect(found).toEqual(null);
    });
  });

  describe("finding all", () => {
    it("case: no collections => returns empty array", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collection.findAll(),
        }),
      );

      // Verify
      expect(found).toEqual([]);
    });

    it("case: some collections => returns them", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();
      const collection1 = {
        id: Id.generate.collection(),
        settings: {
          name: "name 1",
          icon: null,
          collectionCategoryId: null,
        },
        createdAt: new Date(),
      };
      const collection2 = {
        id: Id.generate.collection(),
        settings: {
          name: "name 2",
          icon: null,
          collectionCategoryId: null,
        },
        createdAt: new Date(),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.collection.insert(collection1);
          await repos.collection.insert(collection2);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collection.findAll(),
        }),
      );

      // Verify
      expect(found).toEqual([collection1, collection2]);
    });
  });
});

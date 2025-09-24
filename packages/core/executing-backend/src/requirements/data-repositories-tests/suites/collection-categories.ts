import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect, it } from "vitest";
import type CollectionCategoryEntity from "../../../entities/CollectionCategoryEntity.js";
import type Dependencies from "../Dependencies.js";

export default rd<Dependencies>("Collection categories", (deps) => {
  it("inserting", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();

    // Exercise
    const collectionCategory: CollectionCategoryEntity = {
      id: Id.generate.collectionCategory(),
      name: "name",
      icon: null,
      parentId: null,
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.collectionCategory.insert(collectionCategory);
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.collectionCategory.find(collectionCategory.id),
      }),
    );
    expect(found).toEqual(collectionCategory);
  });

  it("replacing", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();
    const collectionCategory: CollectionCategoryEntity = {
      id: Id.generate.collectionCategory(),
      name: "original name",
      icon: null,
      parentId: null,
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.collectionCategory.insert(collectionCategory);
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const updatedCollectionCategory: CollectionCategoryEntity = {
      ...collectionCategory,
      name: "updated name",
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.collectionCategory.replace(updatedCollectionCategory);
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.collectionCategory.find(collectionCategory.id),
      }),
    );
    expect(found).toEqual(updatedCollectionCategory);
  });

  it("deleting", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();
    const collectionCategory: CollectionCategoryEntity = {
      id: Id.generate.collectionCategory(),
      name: "name",
      icon: null,
      parentId: null,
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.collectionCategory.insert(collectionCategory);
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const deletedId =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collectionCategory.delete(
            collectionCategory.id,
          ),
        }),
      );

    // Verify
    expect(deletedId).toEqual(collectionCategory.id);
    const exists = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.collectionCategory.exists(
          collectionCategory.id,
        ),
      }),
    );
    expect(exists).toEqual(false);
  });

  describe("checking existence", () => {
    it("case: exists", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();
      const collectionCategory: CollectionCategoryEntity = {
        id: Id.generate.collectionCategory(),
        name: "name",
        icon: null,
        parentId: null,
        createdAt: new Date(),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.collectionCategory.insert(collectionCategory);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const exists = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collectionCategory.exists(
            collectionCategory.id,
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
          returnValue: await repos.collectionCategory.exists(
            Id.generate.collectionCategory(),
          ),
        }),
      );

      // Verify
      expect(exists).toEqual(false);
    });
  });

  describe("checking existence by parent", () => {
    it("case: exists", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();
      const parentId = Id.generate.collectionCategory();
      const collectionCategory: CollectionCategoryEntity = {
        id: Id.generate.collectionCategory(),
        name: "name",
        icon: null,
        parentId: parentId,
        createdAt: new Date(),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.collectionCategory.insert(collectionCategory);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const exists = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.collectionCategory.existsWhereParentIdEq(parentId),
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
          returnValue: await repos.collectionCategory.existsWhereParentIdEq(
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
      const collectionCategory: CollectionCategoryEntity = {
        id: Id.generate.collectionCategory(),
        name: "name",
        icon: null,
        parentId: null,
        createdAt: new Date(),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.collectionCategory.insert(collectionCategory);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collectionCategory.find(
            collectionCategory.id,
          ),
        }),
      );

      // Verify
      expect(found).toEqual(collectionCategory);
    });

    it("case: doesn't exist => returns null", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collectionCategory.find(
            Id.generate.collectionCategory(),
          ),
        }),
      );

      // Verify
      expect(found).toEqual(null);
    });
  });

  describe("finding all", () => {
    it("case: no collection categories => returns empty array", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collectionCategory.findAll(),
        }),
      );

      // Verify
      expect(found).toEqual([]);
    });

    it("case: some collection categories => returns them", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();
      const collectionCategory1: CollectionCategoryEntity = {
        id: Id.generate.collectionCategory(),
        name: "name 1",
        icon: null,
        parentId: null,
        createdAt: new Date(),
      };
      const collectionCategory2: CollectionCategoryEntity = {
        id: Id.generate.collectionCategory(),
        name: "name 2",
        icon: null,
        parentId: null,
        createdAt: new Date(),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.collectionCategory.insert(collectionCategory1);
          await repos.collectionCategory.insert(collectionCategory2);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collectionCategory.findAll(),
        }),
      );

      // Verify
      expect(found).toEqual([collectionCategory1, collectionCategory2]);
    });
  });
});

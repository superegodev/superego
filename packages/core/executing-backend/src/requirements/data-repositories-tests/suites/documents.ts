import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect, it } from "vitest";
import type Dependencies from "../Dependencies.js";

export default rd<Dependencies>("Documents", (deps) => {
  it("inserting", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();

    // Exercise
    const document = {
      id: Id.generate.document(),
      collectionId: Id.generate.collection(),
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.document.insert(document);
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const exists = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.document.exists(document.id),
      }),
    );
    expect(exists).toEqual(true);
  });

  it("deleting", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();
    const document = {
      id: Id.generate.document(),
      collectionId: Id.generate.collection(),
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.document.insert(document);
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const deletedId =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.document.delete(document.id),
        }),
      );

    // Verify
    expect(deletedId).toEqual(document.id);
    const exists = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.document.exists(document.id),
      }),
    );
    expect(exists).toEqual(false);
  });

  it("deleting all by collection id", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();
    const collection1Id = Id.generate.collection();
    const collection2Id = Id.generate.collection();
    const document1 = {
      id: Id.generate.document(),
      collectionId: collection1Id,
      createdAt: new Date(),
    };
    const document2 = {
      id: Id.generate.document(),
      collectionId: collection1Id,
      createdAt: new Date(),
    };
    const document3 = {
      id: Id.generate.document(),
      collectionId: collection2Id,
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.document.insert(document1);
        await repos.document.insert(document2);
        await repos.document.insert(document3);
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const deletedIds =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.document.deleteAllWhereCollectionIdEq(collection1Id),
        }),
      );

    // Verify
    expect(deletedIds).toEqual([document1.id, document2.id]);
    const collection1Documents =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.document.findAllWhereCollectionIdEq(collection1Id),
        }),
      );
    expect(collection1Documents).toEqual([]);
    const collection2Documents =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.document.findAllWhereCollectionIdEq(collection2Id),
        }),
      );
    expect(collection2Documents).toEqual([document3]);
  });

  describe("checking existence", () => {
    it("case: exists", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();
      const document = {
        id: Id.generate.document(),
        collectionId: Id.generate.collection(),
        createdAt: new Date(),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.document.insert(document);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const exists = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.document.exists(document.id),
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
          returnValue: await repos.document.exists(Id.generate.document()),
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
      const document = {
        id: Id.generate.document(),
        collectionId: Id.generate.collection(),
        createdAt: new Date(),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.document.insert(document);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.document.find(document.id),
        }),
      );

      // Verify
      expect(found).toEqual(document);
    });

    it("case: doesn't exist => returns null", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.document.find(Id.generate.document()),
        }),
      );

      // Verify
      expect(found).toEqual(null);
    });
  });

  describe("finding all by collection id", () => {
    it("case: no documents in collection => returns empty array", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.document.findAllWhereCollectionIdEq(
            Id.generate.collection(),
          ),
        }),
      );

      // Verify
      expect(found).toEqual([]);
    });

    it("case: some documents in collection => returns them", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();
      const collection1Id = Id.generate.collection();
      const collection2Id = Id.generate.collection();
      const document1 = {
        id: Id.generate.document(),
        collectionId: collection1Id,
        createdAt: new Date(),
      };
      const document2 = {
        id: Id.generate.document(),
        collectionId: collection1Id,
        createdAt: new Date(),
      };
      const document3 = {
        id: Id.generate.document(),
        collectionId: collection2Id,
        createdAt: new Date(),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.document.insert(document1);
          await repos.document.insert(document2);
          await repos.document.insert(document3);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.document.findAllWhereCollectionIdEq(collection1Id),
        }),
      );

      // Verify
      expect(found).toEqual([document1, document2]);
    });
  });
});

import type { CollectionVersionSettings } from "@superego/backend";
import { DataType, type Schema } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect, it } from "vitest";
import type Dependencies from "../Dependencies.js";

const schema: Schema = {
  types: { Root: { dataType: DataType.Struct, properties: {} } },
  rootType: "Root",
};
const settings: CollectionVersionSettings = {
  summaryProperties: [
    { name: { en: "name" }, getter: { source: "", compiled: "" } },
  ],
};

export default rd<Dependencies>("Collection versions", (deps) => {
  it("inserting", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();

    // Exercise
    const collectionVersion = {
      id: Id.generate.collectionVersion(),
      previousVersionId: null,
      collectionId: Id.generate.collection(),
      schema: schema,
      settings: settings,
      migration: null,
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.collectionVersion.insert(collectionVersion);
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue:
          await repos.collectionVersion.findLatestWhereCollectionIdEq(
            collectionVersion.collectionId,
          ),
      }),
    );
    expect(found).toEqual(collectionVersion);
  });

  it("replacing", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();
    const collectionVersion = {
      id: Id.generate.collectionVersion(),
      previousVersionId: null,
      collectionId: Id.generate.collection(),
      schema: schema,
      settings: {
        summaryProperties: [
          {
            name: { en: "original name" },
            getter: { source: "", compiled: "" },
          },
        ],
      } satisfies CollectionVersionSettings,
      migration: null,
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.collectionVersion.insert(collectionVersion);
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const updatedCollectionVersion = {
      ...collectionVersion,
      settings: {
        summaryProperties: [
          {
            name: { en: "updated name" },
            getter: { source: "", compiled: "" },
          },
        ],
      } satisfies CollectionVersionSettings,
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.collectionVersion.replace(updatedCollectionVersion);
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue:
          await repos.collectionVersion.findLatestWhereCollectionIdEq(
            collectionVersion.collectionId,
          ),
      }),
    );
    expect(found).toEqual(updatedCollectionVersion);
  });

  it("deleting all by collection id", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();
    const collection1Id = Id.generate.collection();
    const collection2Id = Id.generate.collection();
    const collectionVersion1 = {
      id: Id.generate.collectionVersion(),
      previousVersionId: null,
      collectionId: collection1Id,
      schema: schema,
      settings: settings,
      migration: null,
      createdAt: new Date(),
    };
    const collectionVersion2 = {
      id: Id.generate.collectionVersion(),
      previousVersionId: collectionVersion1.id,
      collectionId: collection1Id,
      schema: schema,
      settings: settings,
      migration: null,
      createdAt: new Date(),
    };
    const collectionVersion3 = {
      id: Id.generate.collectionVersion(),
      previousVersionId: null,
      collectionId: collection2Id,
      schema: schema,
      settings: settings,
      migration: null,
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.collectionVersion.insert(collectionVersion1);
        await repos.collectionVersion.insert(collectionVersion2);
        await repos.collectionVersion.insert(collectionVersion3);
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const deletedIds =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.collectionVersion.deleteAllWhereCollectionIdEq(
              collection1Id,
            ),
        }),
      );

    // Verify
    expect(deletedIds).toEqual([collectionVersion1.id, collectionVersion2.id]);
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.collectionVersion.findAllLatests(),
      }),
    );
    expect(found).toEqual([collectionVersion3]);
  });

  describe("finding latest by collection id", () => {
    it("case: exists => returns latest", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();
      const collectionId = Id.generate.collection();
      const collectionVersion1 = {
        id: Id.generate.collectionVersion(),
        previousVersionId: null,
        collectionId: collectionId,
        schema: schema,
        settings: settings,
        migration: null,
        createdAt: new Date(),
      };
      const collectionVersion2 = {
        id: Id.generate.collectionVersion(),
        previousVersionId: collectionVersion1.id,
        collectionId: collectionId,
        schema: schema,
        settings: settings,
        migration: null,
        createdAt: new Date(),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.collectionVersion.insert(collectionVersion1);
          await repos.collectionVersion.insert(collectionVersion2);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.collectionVersion.findLatestWhereCollectionIdEq(
              collectionId,
            ),
        }),
      );

      // Verify
      expect(found).toEqual(collectionVersion2);
    });

    it("case: doesn't exist => returns null", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue:
            await repos.collectionVersion.findLatestWhereCollectionIdEq(
              Id.generate.collection(),
            ),
        }),
      );

      // Verify
      expect(found).toEqual(null);
    });
  });

  describe("finding all latests", () => {
    it("case: no collection versions => returns empty array", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collectionVersion.findAllLatests(),
        }),
      );

      // Verify
      expect(found).toEqual([]);
    });

    it("case: some collection versions => returns latest from each collection", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();
      const collection1Id = Id.generate.collection();
      const collection2Id = Id.generate.collection();
      const collectionVersion1 = {
        id: Id.generate.collectionVersion(),
        previousVersionId: null,
        collectionId: collection1Id,
        schema: schema,
        settings: settings,
        migration: null,
        createdAt: new Date(),
      };
      const collectionVersion2 = {
        id: Id.generate.collectionVersion(),
        previousVersionId: collectionVersion1.id,
        collectionId: collection1Id,
        schema: schema,
        settings: settings,
        migration: null,
        createdAt: new Date(),
      };
      const collectionVersion3 = {
        id: Id.generate.collectionVersion(),
        previousVersionId: null,
        collectionId: collection2Id,
        schema: schema,
        settings: settings,
        migration: null,
        createdAt: new Date(),
      };

      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.collectionVersion.insert(collectionVersion1);
          await repos.collectionVersion.insert(collectionVersion2);
          await repos.collectionVersion.insert(collectionVersion3);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collectionVersion.findAllLatests(),
        }),
      );

      // Verify
      expect(found).toEqual([collectionVersion2, collectionVersion3]);
    });
  });
});

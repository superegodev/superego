import type { CollectionVersionSettings } from "@superego/backend";
import { DataType, type Schema } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect, it } from "vitest";
import type CollectionVersionEntity from "../../../entities/CollectionVersionEntity.js";
import type Dependencies from "../Dependencies.js";

const schema: Schema = {
  types: { Root: { dataType: DataType.Struct, properties: {} } },
  rootType: "Root",
};
const settings: CollectionVersionSettings = {
  contentSummaryGetter: { source: "", compiled: "" },
};

export default rd<Dependencies>("Collection versions", (deps) => {
  it("inserting", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();

    // Exercise
    const collectionVersion: CollectionVersionEntity = {
      id: Id.generate.collectionVersion(),
      previousVersionId: null,
      collectionId: Id.generate.collection(),
      schema: schema,
      settings: settings,
      migration: null,
      remoteConverters: null,
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
    const collectionVersion: CollectionVersionEntity = {
      id: Id.generate.collectionVersion(),
      previousVersionId: null,
      collectionId: Id.generate.collection(),
      schema: schema,
      settings: settings,
      migration: null,
      remoteConverters: null,
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.collectionVersion.insert(collectionVersion);
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const updatedCollectionVersion: CollectionVersionEntity = {
      ...collectionVersion,
      settings: {
        contentSummaryGetter: {
          source: "updatedSource",
          compiled: "updatedCompiled",
        },
      },
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
    const collectionVersion1: CollectionVersionEntity = {
      id: Id.generate.collectionVersion(),
      previousVersionId: null,
      collectionId: collection1Id,
      schema: schema,
      settings: settings,
      migration: null,
      remoteConverters: null,
      createdAt: new Date(),
    };
    const collectionVersion2: CollectionVersionEntity = {
      id: Id.generate.collectionVersion(),
      previousVersionId: collectionVersion1.id,
      collectionId: collection1Id,
      schema: schema,
      settings: settings,
      migration: null,
      remoteConverters: null,
      createdAt: new Date(),
    };
    const collectionVersion3: CollectionVersionEntity = {
      id: Id.generate.collectionVersion(),
      previousVersionId: null,
      collectionId: collection2Id,
      schema: schema,
      settings: settings,
      migration: null,
      remoteConverters: null,
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

  describe("finding one", () => {
    it("case: exists => returns it", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();
      const collectionVersion: CollectionVersionEntity = {
        id: Id.generate.collectionVersion(),
        previousVersionId: null,
        collectionId: Id.generate.collection(),
        schema: schema,
        settings: settings,
        migration: null,
        remoteConverters: null,
        createdAt: new Date(),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.collectionVersion.insert(collectionVersion);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collectionVersion.find(collectionVersion.id),
        }),
      );

      // Verify
      expect(found).toEqual(collectionVersion);
    });

    it("case: doesn't exist => returns null", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collectionVersion.find(
            Id.generate.collectionVersion(),
          ),
        }),
      );

      // Verify
      expect(found).toEqual(null);
    });
  });

  describe("finding latest by collection id", () => {
    it("case: exists => returns latest", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();
      const collectionId = Id.generate.collection();
      const collectionVersion1: CollectionVersionEntity = {
        id: Id.generate.collectionVersion(),
        previousVersionId: null,
        collectionId: collectionId,
        schema: schema,
        settings: settings,
        migration: null,
        remoteConverters: null,
        createdAt: new Date(),
      };
      const collectionVersion2: CollectionVersionEntity = {
        id: Id.generate.collectionVersion(),
        previousVersionId: collectionVersion1.id,
        collectionId: collectionId,
        schema: schema,
        settings: settings,
        migration: null,
        remoteConverters: null,
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
      const collectionVersion1: CollectionVersionEntity = {
        id: Id.generate.collectionVersion(),
        previousVersionId: null,
        collectionId: collection1Id,
        schema: schema,
        settings: settings,
        migration: null,
        remoteConverters: null,
        createdAt: new Date(),
      };
      const collectionVersion2: CollectionVersionEntity = {
        id: Id.generate.collectionVersion(),
        previousVersionId: collectionVersion1.id,
        collectionId: collection1Id,
        schema: schema,
        settings: settings,
        migration: null,
        remoteConverters: null,
        createdAt: new Date(),
      };
      const collectionVersion3: CollectionVersionEntity = {
        id: Id.generate.collectionVersion(),
        previousVersionId: null,
        collectionId: collection2Id,
        schema: schema,
        settings: settings,
        migration: null,
        remoteConverters: null,
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

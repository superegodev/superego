import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it } from "vitest";
import type CollectionCategoryEntity from "../../../entities/CollectionCategoryEntity.js";
import type DataRepositories from "../../DataRepositories.js";
import type GetDependencies from "../GetDependencies.js";
import WorkflowEvent from "../utils/WorkflowEvent.js";

export default rd<GetDependencies>("Transactions", (deps) => {
  it("when fn completes with action commit, changes are persisted", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();

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
    const collectionCategories =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collectionCategory.findAll(),
        }),
      );
    expect(collectionCategories).toEqual([collectionCategory]);
  });

  it("when fn completes with action rollback, changes are NOT persisted", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();

    // Exercise
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.collectionCategory.insert({
          id: Id.generate.collectionCategory(),
          name: "name",
          icon: null,
          parentId: null,
          createdAt: new Date(),
        });
        return { action: "rollback", returnValue: null };
      },
    );

    // Verify
    const collectionCategories =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collectionCategory.findAll(),
        }),
      );
    expect(collectionCategories).toEqual([]);
  });

  it("when fn throws, changes are NOT persisted", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();

    // Exercise
    await dataRepositoriesManager
      .runInSerializableTransaction(async (repos) => {
        await repos.collectionCategory.insert({
          id: Id.generate.collectionCategory(),
          name: "name",
          icon: null,
          parentId: null,
          createdAt: new Date(),
        });
        throw new Error();
      })
      .catch(() => {
        // Ignore
      });

    // Verify
    const collectionCategories =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collectionCategory.findAll(),
        }),
      );
    expect(collectionCategories).toEqual([]);
  });

  it("when changes are erroneously made AFTER the transaction has been completed, an error is thrown and no change is made", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();

    // Exercise
    let reposRef: DataRepositories;
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        reposRef = repos;
        return { action: "commit", returnValue: null };
      },
    );
    const insertPromise = reposRef!.collectionCategory.insert({
      id: Id.generate.collectionCategory(),
      name: "name",
      icon: null,
      parentId: null,
      createdAt: new Date(),
    });

    // Verify
    await expect(insertPromise).rejects.toThrow();
    const collectionCategories =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collectionCategory.findAll(),
        }),
      );
    expect(collectionCategories).toEqual([]);
  });

  it("uncommitted changes are not visible to other transactions", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();

    // Exercise
    const collectionCategory: CollectionCategoryEntity = {
      id: Id.generate.collectionCategory(),
      name: "name",
      icon: null,
      parentId: null,
      createdAt: new Date(),
    };
    const concurrentCollectionCategories =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.collectionCategory.insert(collectionCategory);
          return {
            action: "commit",
            returnValue:
              // As per the runInSerializableTransaction requirement,
              // transactions are not nestable, so we expect this following
              // transaction to be isolated from the "parent" one and not to see
              // any collection category in the database.
              await dataRepositoriesManager.runInSerializableTransaction(
                async (repos) => ({
                  action: "commit",
                  returnValue: await repos.collectionCategory.findAll(),
                }),
              ),
          };
        },
      );

    // Verify
    expect(concurrentCollectionCategories).toEqual([]);
    const subsequentCollectionCategories =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collectionCategory.findAll(),
        }),
      );
    expect(subsequentCollectionCategories).toEqual([collectionCategory]);
  });

  describe("when two concurrent transactions cannot be serialized, one fails and its changes are not persisted, while the other succeeds", () => {
    // Timeline:
    //
    // t1 │ begin  write                              commit  │ ✓
    // ───┼───┴──────┴──────┬─────┬──────┬──────┬───────┴─────┼──
    // t2 │               begin  read  write  commit          │ ✗
    //
    // Note: different implementations might make t2 fail at different points in
    // time. Regardless of that, the outcome we're testing for is that t2 fails.
    it("case: t1 begin + write, t2 begin + read + write + commit, t1 commit => t1 ✓, t2 ✗", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
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
      const t1State = {
        wrote: new WorkflowEvent(),
        finished: new WorkflowEvent(),
      };
      const t2State = {
        finished: new WorkflowEvent(),
        error: null,
      };
      dataRepositoriesManager
        .runInSerializableTransaction(async (repos) => {
          await repos.collectionCategory
            .replace({ ...collectionCategory, name: "updated name 1" })
            .finally(t1State.wrote.markOccurred);
          await t2State.finished.occurred;
          return { action: "commit", returnValue: null };
        })
        .finally(t1State.finished.markOccurred);
      await t1State.wrote.occurred;
      dataRepositoriesManager
        .runInSerializableTransaction(async (repos) => {
          await repos.collectionCategory.findAll();
          await repos.collectionCategory.replace({
            ...collectionCategory,
            name: "updated name 2",
          });
          return { action: "commit", returnValue: null };
        })
        .catch((error) => {
          t2State.error = error;
        })
        .finally(t2State.finished.markOccurred);
      await Promise.all([t1State.finished.occurred, t2State.finished.occurred]);

      // Verify
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collectionCategory.find(
            collectionCategory.id,
          ),
        }),
      );
      assert.isNotNull(found);
      expect(found.name).toEqual("updated name 1");
      expect(t2State.error).toBeInstanceOf(Error);
    });

    // Timeline:
    //
    // t1 │ begin  write                      commit          │ ✓
    // ───┼───┴──────┴──────┬─────┬──────┬──────┴───────┬─────┼──
    // t2 │               begin  read  write          commit  │ ✗
    //
    // Note: different implementations might make t2 fail at different points in
    // time. Regardless of that, the outcome we're testing for is that t2 fails.
    it("case: t1 begin + write, t2 begin + read + write, t1 commit, t2 commit => t1 ✓, t2 ✗", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
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
      const t1State = {
        wrote: new WorkflowEvent(),
        finished: new WorkflowEvent(),
      };
      const t2State = {
        wrote: new WorkflowEvent(),
        finished: new WorkflowEvent(),
        error: null,
      };
      dataRepositoriesManager
        .runInSerializableTransaction(async (repos) => {
          await repos.collectionCategory
            .replace({ ...collectionCategory, name: "updated name 1" })
            .finally(t1State.wrote.markOccurred);
          await t2State.wrote.occurred;
          return { action: "commit", returnValue: null };
        })
        .finally(t1State.finished.markOccurred);
      await t1State.wrote.occurred;
      dataRepositoriesManager
        .runInSerializableTransaction(async (repos) => {
          await repos.collectionCategory.findAll();
          await repos.collectionCategory
            .replace({ ...collectionCategory, name: "updated name 2" })
            .finally(t2State.wrote.markOccurred);
          await t1State.finished.occurred;
          return { action: "commit", returnValue: null };
        })
        .catch((error) => {
          t2State.error = error;
        })
        .finally(t2State.finished.markOccurred);
      await Promise.all([t1State.finished.occurred, t2State.finished.occurred]);

      // Verify
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collectionCategory.find(
            collectionCategory.id,
          ),
        }),
      );
      assert.isNotNull(found);
      expect(found.name).toEqual("updated name 1");
      expect(t2State.error).toBeInstanceOf(Error);
    });

    // Timeline:
    //
    // t1 │ begin  read                write  commit          │ ✗
    // ───┼───┴──────┴──────┬─────┬──────┴──────┴───────┬─────┼──
    // t2 │              begin  write                 commit  │ ✓
    //
    // Note: different implementations might make t1 fail at different points in
    // time. Regardless of that, the outcome we're testing for is that t1 fails.
    it("case: t1 begin + read, t2 begin + write, t1 write + commit, t2 commit => t1 ✗, t2 ✓", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
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
      const t1State = {
        read: new WorkflowEvent(),
        wrote: new WorkflowEvent(),
        finished: new WorkflowEvent(),
        error: null,
      };
      const t2State = {
        wrote: new WorkflowEvent(),
        finished: new WorkflowEvent(),
      };
      dataRepositoriesManager
        .runInSerializableTransaction(async (repos) => {
          await repos.collectionCategory
            .findAll()
            .finally(t1State.read.markOccurred);
          await t2State.wrote.occurred;
          await repos.collectionCategory
            .replace({ ...collectionCategory, name: "updated name 1" })
            .finally(t1State.wrote.markOccurred);
          return { action: "commit", returnValue: null };
        })
        .catch((error) => {
          t1State.error = error;
        })
        .finally(t1State.finished.markOccurred);
      await t1State.read.occurred;
      dataRepositoriesManager
        .runInSerializableTransaction(async (repos) => {
          await repos.collectionCategory.replace({
            ...collectionCategory,
            name: "updated name 2",
          });
          t2State.wrote.markOccurred();
          await t1State.wrote.occurred;
          return { action: "commit", returnValue: null };
        })
        .then(() => {
          t2State.finished.markOccurred();
        });
      await Promise.all([t1State.finished.occurred, t2State.finished.occurred]);

      // Verify
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collectionCategory.find(
            collectionCategory.id,
          ),
        }),
      );
      assert.isNotNull(found);
      expect(found.name).toEqual("updated name 2");
      expect(t1State.error).toBeInstanceOf(Error);
    });

    // Timeline:
    //
    // t1 │ begin  read                        write  commit  │ ✗
    // ───┼───┴──────┴──────┬─────┬──────┬───────┴──────┴─────┼──
    // t2 │              begin  write  commit                 │ ✓
    //
    // Note: different implementations might make t1 fail at different points in
    // time. Regardless of that, the outcome we're testing for is that t1 fails.
    it("case: t1 begin + read, t2 begin + write + commit, t1 write + commit => t1 ✗, t2 ✓", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
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
      const t1State = {
        read: new WorkflowEvent(),
        finished: new WorkflowEvent(),
        error: null,
      };
      const t2State = {
        finished: new WorkflowEvent(),
      };
      dataRepositoriesManager
        .runInSerializableTransaction(async (repos) => {
          await repos.collectionCategory
            .findAll()
            .finally(t1State.read.markOccurred);
          await t2State.finished.occurred;
          await repos.collectionCategory.replace({
            ...collectionCategory,
            name: "updated name 1",
          });
          return { action: "commit", returnValue: null };
        })
        .catch((error) => {
          t1State.error = error;
        })
        .finally(t1State.finished.markOccurred);
      await t1State.read.occurred;
      dataRepositoriesManager
        .runInSerializableTransaction(async (repos) => {
          await repos.collectionCategory.replace({
            ...collectionCategory,
            name: "updated name 2",
          });
          return { action: "commit", returnValue: null };
        })
        .finally(t2State.finished.markOccurred);
      await Promise.all([t1State.finished.occurred, t2State.finished.occurred]);

      // Verify
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.collectionCategory.find(
            collectionCategory.id,
          ),
        }),
      );
      assert.isNotNull(found);
      expect(found.name).toEqual("updated name 2");
      expect(t1State.error).toBeInstanceOf(Error);
    });
  });

  describe("Savepoints", () => {
    describe("rolling back to a savepoint only rolls back changes made from that savepoint", () => {
      it("case: roll back to latest, with single savepoint", async () => {
        // Setup SUT
        const { dataRepositoriesManager } = deps();

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
            const savepoint = await repos.createSavepoint();
            await repos.collectionCategory.replace({
              ...collectionCategory,
              name: "updated name",
            });
            await repos.rollbackToSavepoint(savepoint);
            return { action: "commit", returnValue: null };
          },
        );

        // Verify
        const collectionCategories =
          await dataRepositoriesManager.runInSerializableTransaction(
            async (repos) => ({
              action: "commit",
              returnValue: await repos.collectionCategory.findAll(),
            }),
          );
        expect(collectionCategories).toEqual([collectionCategory]);
      });

      it("case: roll back to latest savepoint, with multiple savepoints", async () => {
        // Setup SUT
        const { dataRepositoriesManager } = deps();

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
            await repos.createSavepoint();
            await repos.collectionCategory.replace({
              ...collectionCategory,
              name: "updated name 1",
            });
            const savepoint2 = await repos.createSavepoint();
            await repos.collectionCategory.replace({
              ...collectionCategory,
              name: "updated name 2",
            });
            await repos.rollbackToSavepoint(savepoint2);
            return { action: "commit", returnValue: null };
          },
        );

        // Verify
        const collectionCategories =
          await dataRepositoriesManager.runInSerializableTransaction(
            async (repos) => ({
              action: "commit",
              returnValue: await repos.collectionCategory.findAll(),
            }),
          );
        expect(collectionCategories).toEqual([
          { ...collectionCategory, name: "updated name 1" },
        ]);
      });

      it("case: roll back to non-latest savepoint, with multiple savepoints", async () => {
        // Setup SUT
        const { dataRepositoriesManager } = deps();

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
            const savepoint1 = await repos.createSavepoint();
            await repos.collectionCategory.replace({
              ...collectionCategory,
              name: "updated name 1",
            });
            await repos.createSavepoint();
            await repos.collectionCategory.replace({
              ...collectionCategory,
              name: "updated name 2",
            });
            await repos.rollbackToSavepoint(savepoint1);
            return { action: "commit", returnValue: null };
          },
        );

        // Verify
        const collectionCategories =
          await dataRepositoriesManager.runInSerializableTransaction(
            async (repos) => ({
              action: "commit",
              returnValue: await repos.collectionCategory.findAll(),
            }),
          );
        expect(collectionCategories).toEqual([collectionCategory]);
      });
    });

    describe("committing commits all changes done since savepoints (normally, as one would expect)", () => {
      it("case: single savepoint", async () => {
        // Setup SUT
        const { dataRepositoriesManager } = deps();

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
            await repos.createSavepoint();
            await repos.collectionCategory.replace({
              ...collectionCategory,
              name: "updated name",
            });
            return { action: "commit", returnValue: null };
          },
        );

        // Verify
        const collectionCategories =
          await dataRepositoriesManager.runInSerializableTransaction(
            async (repos) => ({
              action: "commit",
              returnValue: await repos.collectionCategory.findAll(),
            }),
          );
        expect(collectionCategories).toEqual([
          { ...collectionCategory, name: "updated name" },
        ]);
      });

      it("case: multiple savepoints", async () => {
        // Setup SUT
        const { dataRepositoriesManager } = deps();

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
            await repos.createSavepoint();
            await repos.collectionCategory.replace({
              ...collectionCategory,
              name: "updated name 1",
            });
            await repos.createSavepoint();
            await repos.collectionCategory.replace({
              ...collectionCategory,
              name: "updated name 2",
            });
            return { action: "commit", returnValue: null };
          },
        );

        // Verify
        const collectionCategories =
          await dataRepositoriesManager.runInSerializableTransaction(
            async (repos) => ({
              action: "commit",
              returnValue: await repos.collectionCategory.findAll(),
            }),
          );
        expect(collectionCategories).toEqual([
          { ...collectionCategory, name: "updated name 2" },
        ]);
      });
    });
  });
});

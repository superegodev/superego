import { BackgroundJobName, BackgroundJobStatus } from "@superego/backend";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect, it } from "vitest";
import type BackgroundJobEntity from "../../../entities/BackgroundJobEntity.js";
import type Dependencies from "../Dependencies.js";

export default rd<Dependencies>("Background jobs", (deps) => {
  it("inserting", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();

    // Exercise
    const backgroundJob: BackgroundJobEntity = {
      id: Id.generate.backgroundJob(),
      name: BackgroundJobName.ProcessConversation,
      input: { conversationId: Id.generate.conversation() },
      status: BackgroundJobStatus.Enqueued,
      enqueuedAt: new Date(),
      startedProcessingAt: null,
      finishedProcessingAt: null,
      error: null,
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.backgroundJob.insert(backgroundJob);
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.backgroundJob.find(backgroundJob.id),
      }),
    );
    expect(found).toEqual(backgroundJob);
  });

  it("replacing", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();
    const backgroundJob: BackgroundJobEntity = {
      id: Id.generate.backgroundJob(),
      name: BackgroundJobName.ProcessConversation,
      input: { conversationId: Id.generate.conversation() },
      status: BackgroundJobStatus.Enqueued,
      enqueuedAt: new Date(),
      startedProcessingAt: null,
      finishedProcessingAt: null,
      error: null,
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.backgroundJob.insert(backgroundJob);
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const updatedBackgroundJob: BackgroundJobEntity = {
      ...backgroundJob,
      status: BackgroundJobStatus.Processing,
      startedProcessingAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.backgroundJob.replace(updatedBackgroundJob);
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.backgroundJob.find(backgroundJob.id),
      }),
    );
    expect(found).toEqual(updatedBackgroundJob);
  });

  describe("finding one", () => {
    it("case: exists => returns it", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();
      const backgroundJob: BackgroundJobEntity = {
        id: Id.generate.backgroundJob(),
        name: BackgroundJobName.ProcessConversation,
        input: { conversationId: Id.generate.conversation() },
        status: BackgroundJobStatus.Enqueued,
        enqueuedAt: new Date(),
        startedProcessingAt: null,
        finishedProcessingAt: null,
        error: null,
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.backgroundJob.insert(backgroundJob);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.backgroundJob.find(backgroundJob.id),
        }),
      );

      // Verify
      expect(found).toEqual(backgroundJob);
    });

    it("case: doesn't exist => returns null", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.backgroundJob.find(
            Id.generate.backgroundJob(),
          ),
        }),
      );

      // Verify
      expect(found).toEqual(null);
    });
  });

  describe("finding all", () => {
    it("case: no background jobs => returns empty array", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.backgroundJob.findAll(),
        }),
      );

      // Verify
      expect(found).toEqual([]);
    });

    it("case: some background jobs => returns them", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();
      const backgroundJob1: BackgroundJobEntity = {
        id: Id.generate.backgroundJob(),
        name: BackgroundJobName.ProcessConversation,
        input: { conversationId: Id.generate.conversation() },
        status: BackgroundJobStatus.Enqueued,
        enqueuedAt: new Date(),
        startedProcessingAt: null,
        finishedProcessingAt: null,
        error: null,
      };
      const backgroundJob2: BackgroundJobEntity = {
        id: Id.generate.backgroundJob(),
        name: BackgroundJobName.ProcessConversation,
        input: { conversationId: Id.generate.conversation() },
        status: BackgroundJobStatus.Enqueued,
        enqueuedAt: new Date(),
        startedProcessingAt: null,
        finishedProcessingAt: null,
        error: null,
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.backgroundJob.insert(backgroundJob1);
          await repos.backgroundJob.insert(backgroundJob2);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.backgroundJob.findAll(),
        }),
      );

      // Verify
      expect(found).toEqual([backgroundJob1, backgroundJob2]);
    });
  });
});

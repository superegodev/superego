import { AssistantName, ConversationFormat } from "@superego/backend";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect, it } from "vitest";
import type ConversationEntity from "../../../entities/ConversationEntity.js";
import type Dependencies from "../Dependencies.js";

export default rd<Dependencies>("Conversations", (deps) => {
  it("inserting (via upsert)", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();

    // Exercise
    const conversation: ConversationEntity = {
      id: Id.generate.conversation(),
      assistant: AssistantName.DocumentCreator,
      format: ConversationFormat.Text,
      title: "title",
      contextFingerprint: "contextFingerprint",
      messages: [],
      isCompleted: false,
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.conversation.upsert(conversation);
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.conversation.find(conversation.id),
      }),
    );
    expect(found).toEqual(conversation);
  });

  it("updating (via upsert)", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();
    const conversation: ConversationEntity = {
      id: Id.generate.conversation(),
      assistant: AssistantName.DocumentCreator,
      format: ConversationFormat.Text,
      title: "original title",
      contextFingerprint: "contextFingerprint",
      messages: [],
      isCompleted: false,
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.conversation.upsert(conversation);
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const updatedConversation: ConversationEntity = {
      ...conversation,
      title: "updated title",
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.conversation.upsert(updatedConversation);
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.conversation.find(conversation.id),
      }),
    );
    expect(found).toEqual(updatedConversation);
  });

  it("deleting", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();
    const conversation: ConversationEntity = {
      id: Id.generate.conversation(),
      assistant: AssistantName.DocumentCreator,
      format: ConversationFormat.Text,
      title: "title",
      contextFingerprint: "contextFingerprint",
      messages: [],
      isCompleted: false,
      createdAt: new Date(),
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.conversation.upsert(conversation);
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const deletedId =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.conversation.delete(conversation.id),
        }),
      );

    // Verify
    expect(deletedId).toEqual(conversation.id);
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.conversation.find(conversation.id),
      }),
    );
    expect(found).toEqual(null);
  });

  describe("finding one", () => {
    it("case: exists => returns it", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();
      const conversation: ConversationEntity = {
        id: Id.generate.conversation(),
        assistant: AssistantName.DocumentCreator,
        format: ConversationFormat.Text,
        title: "title",
        contextFingerprint: "contextFingerprint",
        messages: [],
        isCompleted: false,
        createdAt: new Date(),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.conversation.upsert(conversation);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.conversation.find(conversation.id),
        }),
      );

      // Verify
      expect(found).toEqual(conversation);
    });

    it("case: doesn't exist => returns null", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.conversation.find(
            Id.generate.conversation(),
          ),
        }),
      );

      // Verify
      expect(found).toEqual(null);
    });
  });

  describe("finding all", () => {
    it("case: no conversations => returns empty array", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.conversation.findAll(),
        }),
      );

      // Verify
      expect(found).toEqual([]);
    });

    it("case: some conversations => returns them (ordered by createdAt, desc)", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = await deps();
      const conversation1: ConversationEntity = {
        id: Id.generate.conversation(),
        assistant: AssistantName.DocumentCreator,
        format: ConversationFormat.Text,
        title: "title 1",
        contextFingerprint: "contextFingerprint",
        messages: [],
        isCompleted: false,
        createdAt: new Date(1),
      };
      const conversation2: ConversationEntity = {
        id: Id.generate.conversation(),
        assistant: AssistantName.DocumentCreator,
        format: ConversationFormat.Text,
        title: "title 2",
        contextFingerprint: "contextFingerprint",
        messages: [],
        isCompleted: false,
        createdAt: new Date(2),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.conversation.upsert(conversation1);
          await repos.conversation.upsert(conversation2);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.conversation.findAll(),
        }),
      );

      // Verify
      expect(found).toEqual([conversation2, conversation1]);
    });
  });
});

import {
  AssistantName,
  type AudioContent,
  ConversationStatus,
  MessageContentPartType,
  MessageRole,
} from "@superego/backend";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect, it } from "vitest";
import type ConversationEntity from "../../../entities/ConversationEntity.js";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("Conversations", (deps) => {
  it("inserting (via upsert)", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();

    // Exercise
    const audio: AudioContent = {
      // Smallest possible WAV.
      content: new Uint8Array([
        0x52, 0x49, 0x46, 0x46, 0x25, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
        0x66, 0x6d, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
        0x40, 0x1f, 0x00, 0x00, 0x40, 0x1f, 0x00, 0x00, 0x01, 0x00, 0x08, 0x00,
        0x64, 0x61, 0x74, 0x61, 0x01, 0x00, 0x00, 0x00, 0x80,
      ]),
      contentType: "audio/wav",
    };
    const conversation: ConversationEntity = {
      id: Id.generate.conversation(),
      assistant: AssistantName.Factotum,
      title: "title",
      contextFingerprint: "contextFingerprint",
      messages: [
        {
          role: MessageRole.User,
          content: [
            { type: MessageContentPartType.Text, text: "text", audio },
            { type: MessageContentPartType.Audio, audio },
          ],
          createdAt: new Date(),
        },
      ],
      status: ConversationStatus.Idle,
      error: null,
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
    const { dataRepositoriesManager } = deps();
    const conversation: ConversationEntity = {
      id: Id.generate.conversation(),
      assistant: AssistantName.Factotum,
      title: "original title",
      contextFingerprint: "contextFingerprint",
      messages: [],
      status: ConversationStatus.Idle,
      error: null,
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
    const { dataRepositoriesManager } = deps();
    const conversation: ConversationEntity = {
      id: Id.generate.conversation(),
      assistant: AssistantName.Factotum,
      title: "title",
      contextFingerprint: "contextFingerprint",
      messages: [],
      status: ConversationStatus.Idle,
      error: null,
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

  describe("checking existence", () => {
    it("case: exists", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const conversation: ConversationEntity = {
        id: Id.generate.conversation(),
        assistant: AssistantName.Factotum,
        title: "title",
        contextFingerprint: "contextFingerprint",
        messages: [],
        status: ConversationStatus.Idle,
        error: null,
        createdAt: new Date(),
      };
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.conversation.upsert(conversation);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const exists = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.conversation.exists(conversation.id),
        }),
      );

      // Verify
      expect(exists).toEqual(true);
    });

    it("case: doesn't exist", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();

      // Exercise
      const exists = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.conversation.exists(
            Id.generate.conversation(),
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
      const { dataRepositoriesManager } = deps();
      const conversation: ConversationEntity = {
        id: Id.generate.conversation(),
        assistant: AssistantName.Factotum,
        title: "title",
        contextFingerprint: "contextFingerprint",
        messages: [],
        status: ConversationStatus.Idle,
        error: null,
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
      const { dataRepositoriesManager } = deps();

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
      const { dataRepositoriesManager } = deps();

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
      const { dataRepositoriesManager } = deps();
      const conversation1: ConversationEntity = {
        id: Id.generate.conversation(),
        assistant: AssistantName.Factotum,
        title: "title 1",
        contextFingerprint: "contextFingerprint",
        messages: [],
        status: ConversationStatus.Idle,
        error: null,
        createdAt: new Date(1),
      };
      const conversation2: ConversationEntity = {
        id: Id.generate.conversation(),
        assistant: AssistantName.Factotum,
        title: "title 2",
        contextFingerprint: "contextFingerprint",
        messages: [],
        status: ConversationStatus.Idle,
        error: null,
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

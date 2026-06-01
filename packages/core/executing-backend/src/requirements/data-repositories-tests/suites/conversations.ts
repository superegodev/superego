import {
  AssistantName,
  type AudioContent,
  ConversationStatus,
  type Message,
  MessageContentPartType,
  MessageRole,
} from "@superego/backend";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("Conversations", (deps) => {
  it("creating and appending a message", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();
    const conversationId = Id.generate.conversation();
    const createdAt = new Date();
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
    const message = {
      id: Id.generate.message(),
      role: MessageRole.User,
      content: [
        { type: MessageContentPartType.Text, text: "text", audio },
        { type: MessageContentPartType.Audio, audio },
      ],
      createdAt,
    } satisfies Message.User;

    // Exercise
    const nodeId = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.conversation.create({
          id: conversationId,
          assistant: AssistantName.Factotum,
          contextFingerprint: "contextFingerprint",
          createdAt,
        });
        const appendedNodeId = await repos.conversation.appendMessage(
          conversationId,
          null,
          message,
        );
        return { action: "commit", returnValue: appendedNodeId };
      },
    );

    // Verify
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.conversation.find(conversationId),
      }),
    );
    expect(found).toEqual({
      id: conversationId,
      assistant: AssistantName.Factotum,
      title: null,
      contextFingerprint: "contextFingerprint",
      nodes: [
        {
          type: "Message",
          id: nodeId,
          previousNodeId: null,
          message,
          createdAt,
        },
      ],
      activeNodeId: nodeId,
      status: ConversationStatus.Idle,
      processingStartedAt: null,
      error: null,
      createdAt,
    });
  });

  it("updating a message and setting a title", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();
    const conversationId = Id.generate.conversation();
    const createdAt = new Date();
    const message = {
      id: Id.generate.message(),
      role: MessageRole.User,
      content: [{ type: MessageContentPartType.Text, text: "original" }],
      createdAt,
    } satisfies Message.User;
    const updatedMessage = {
      ...message,
      content: [{ type: MessageContentPartType.Text, text: "updated" }],
    } satisfies Message.User;
    const nodeId = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.conversation.create({
          id: conversationId,
          assistant: AssistantName.Factotum,
          contextFingerprint: "contextFingerprint",
          createdAt,
        });
        const appendedNodeId = await repos.conversation.appendMessage(
          conversationId,
          null,
          message,
        );
        return { action: "commit", returnValue: appendedNodeId };
      },
    );

    // Exercise
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.conversation.updateMessage(
          conversationId,
          nodeId,
          updatedMessage,
        );
        await repos.conversation.setTitle(conversationId, "updated title");
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.conversation.find(conversationId),
      }),
    );
    expect(found?.title).toEqual("updated title");
    expect(found?.nodes).toMatchObject([
      { id: nodeId, message: updatedMessage },
    ]);
  });

  it("branching from an earlier node", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();
    const conversationId = Id.generate.conversation();
    const createdAt = new Date();
    const messages = ["U1", "A1", "U2", "A2", "A2 retry"].map(
      (text, index) =>
        ({
          id: Id.generate.message(),
          role:
            index === 1 || index >= 3
              ? MessageRole.Assistant
              : MessageRole.User,
          content: [{ type: MessageContentPartType.Text, text }],
          reasoning: {},
          inferenceOptions: {
            completion: {
              providerModelRef: { providerName: "p", modelName: "m" },
              reasoningEffort: "Medium",
            },
            transcription: null,
            fileInspection: null,
          },
          generationStats: {
            timeTaken: 0,
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
          },
          createdAt: new Date(index),
        }) as any,
    );

    // Exercise
    const nodeIds = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.conversation.create({
          id: conversationId,
          assistant: AssistantName.Factotum,
          contextFingerprint: "contextFingerprint",
          createdAt,
        });
        const node1 = await repos.conversation.appendMessage(
          conversationId,
          null,
          messages[0]!,
        );
        const node2 = await repos.conversation.appendMessage(
          conversationId,
          node1,
          messages[1]!,
        );
        const node3 = await repos.conversation.appendMessage(
          conversationId,
          node2,
          messages[2]!,
        );
        const node4 = await repos.conversation.appendMessage(
          conversationId,
          node3,
          messages[3]!,
        );
        const node5 = await repos.conversation.appendMessage(
          conversationId,
          node3,
          messages[4]!,
        );
        return {
          action: "commit",
          returnValue: [node1, node2, node3, node4, node5],
        };
      },
    );

    // Verify
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.conversation.find(conversationId),
      }),
    );
    expect(found?.nodes).toHaveLength(5);
    expect(found?.nodes.find((node) => node.id === nodeIds[3])).toMatchObject({
      previousNodeId: nodeIds[2],
    });
    expect(found?.nodes.find((node) => node.id === nodeIds[4])).toMatchObject({
      previousNodeId: nodeIds[2],
    });
    expect(found?.activeNodeId).toEqual(nodeIds[4]);
  });

  it("processing transitions and branch-local errors", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();
    const conversationId = Id.generate.conversation();
    const createdAt = new Date();
    const message = {
      id: Id.generate.message(),
      role: MessageRole.User,
      content: [{ type: MessageContentPartType.Text, text: "text" }],
      createdAt,
    } satisfies Message.User;
    const error = { name: "UnexpectedError", details: { cause: "test" } };

    // Exercise
    const { nodeId, errorNodeId, processingStartedAt } =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.conversation.create({
            id: conversationId,
            assistant: AssistantName.Factotum,
            contextFingerprint: "contextFingerprint",
            createdAt,
          });
          const appendedNodeId = await repos.conversation.appendMessage(
            conversationId,
            null,
            message,
          );
          const startedAt = new Date();
          await repos.conversation.markProcessingStarted(
            conversationId,
            appendedNodeId,
            startedAt,
          );
          await repos.conversation.markProcessingCompleted(conversationId);
          await repos.conversation.markProcessingStarted(
            conversationId,
            appendedNodeId,
            startedAt,
          );
          const appendedErrorNodeId =
            await repos.conversation.markProcessingFailed(
              conversationId,
              appendedNodeId,
              error,
            );
          return {
            action: "commit",
            returnValue: {
              nodeId: appendedNodeId,
              errorNodeId: appendedErrorNodeId,
              processingStartedAt: startedAt,
            },
          };
        },
      );

    // Verify
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.conversation.find(conversationId),
      }),
    );
    expect(processingStartedAt).toBeInstanceOf(Date);
    expect(found).toMatchObject({
      status: ConversationStatus.Error,
      activeNodeId: errorNodeId,
      error,
      processingStartedAt: null,
    });
    expect(found?.nodes).toEqual([
      expect.objectContaining({ id: nodeId, type: "Message" }),
      expect.objectContaining({
        id: errorNodeId,
        type: "Error",
        previousNodeId: nodeId,
        error,
      }),
    ]);
  });

  it("deleting hides the conversation", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();
    const conversationId = Id.generate.conversation();
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.conversation.create({
          id: conversationId,
          assistant: AssistantName.Factotum,
          contextFingerprint: "contextFingerprint",
          createdAt: new Date(),
        });
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const deletedId =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.conversation.delete(conversationId),
        }),
      );

    // Verify
    expect(deletedId).toEqual(conversationId);
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.conversation.find(conversationId),
      }),
    );
    expect(found).toEqual(null);
  });

  describe("checking existence", () => {
    it("case: exists", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const conversationId = Id.generate.conversation();
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.conversation.create({
            id: conversationId,
            assistant: AssistantName.Factotum,
            contextFingerprint: "contextFingerprint",
            createdAt: new Date(),
          });
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const exists = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.conversation.exists(conversationId),
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
      const conversation1Id = Id.generate.conversation();
      const conversation2Id = Id.generate.conversation();
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.conversation.create({
            id: conversation1Id,
            assistant: AssistantName.Factotum,
            contextFingerprint: "contextFingerprint",
            createdAt: new Date(1),
          });
          await repos.conversation.create({
            id: conversation2Id,
            assistant: AssistantName.Factotum,
            contextFingerprint: "contextFingerprint",
            createdAt: new Date(2),
          });
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
      expect(found.map(({ id }) => id)).toEqual([
        conversation2Id,
        conversation1Id,
      ]);
    });
  });
});

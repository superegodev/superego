import {
  AssistantName,
  ConversationFormat,
  MessageContentPartType,
} from "@superego/backend";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";
import waitForConversationProcessing from "../utils/waitForConversationProcessing.js";

export default rd<GetDependencies>("Conversations", (deps) => {
  describe("searchConversations", () => {
    it("success: returns empty array when no matches", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const searchResult = await backend.assistants.searchConversations(
        "nonexistent",
        { limit: 20 },
      );

      // Verify
      expect(searchResult).toEqual({
        success: true,
        data: [],
        error: null,
      });
    });

    it("success: searches conversations by user message content", async () => {
      // Setup SUT
      const { backend } = deps();
      const startConversationResult =
        await backend.assistants.startConversation(
          AssistantName.Factotum,
          ConversationFormat.Text,
          [{ type: MessageContentPartType.Text, text: "uniquekeyword alpha" }],
        );
      assert.isTrue(startConversationResult.success);
      await waitForConversationProcessing(
        backend,
        startConversationResult.data.id,
      );

      // Exercise
      const searchResult = await backend.assistants.searchConversations(
        "uniquekeyword",
        { limit: 20 },
      );

      // Verify
      assert.isTrue(searchResult.success);
      expect(searchResult.data).toHaveLength(1);
      expect(searchResult.data[0]).toEqual({
        match: expect.objectContaining({
          id: startConversationResult.data.id,
        }),
        matchedText: expect.any(String),
      });
    });

    it("success: returns multiple matching conversations", async () => {
      // Setup SUT
      const { backend } = deps();
      const startConversationResult1 =
        await backend.assistants.startConversation(
          AssistantName.Factotum,
          ConversationFormat.Text,
          [{ type: MessageContentPartType.Text, text: "commonterm first" }],
        );
      assert.isTrue(startConversationResult1.success);
      await waitForConversationProcessing(
        backend,
        startConversationResult1.data.id,
      );
      const startConversationResult2 =
        await backend.assistants.startConversation(
          AssistantName.Factotum,
          ConversationFormat.Text,
          [{ type: MessageContentPartType.Text, text: "commonterm second" }],
        );
      assert.isTrue(startConversationResult2.success);
      await waitForConversationProcessing(
        backend,
        startConversationResult2.data.id,
      );

      // Exercise
      const searchResult = await backend.assistants.searchConversations(
        "commonterm",
        { limit: 20 },
      );

      // Verify
      assert.isTrue(searchResult.success);
      expect(searchResult.data).toHaveLength(2);
      const resultIds = searchResult.data.map((result) => result.match.id);
      expect(resultIds).toContain(startConversationResult1.data.id);
      expect(resultIds).toContain(startConversationResult2.data.id);
    });

    it("success: does not return non-matching conversations", async () => {
      // Setup SUT
      const { backend } = deps();
      const startConversationResult1 =
        await backend.assistants.startConversation(
          AssistantName.Factotum,
          ConversationFormat.Text,
          [{ type: MessageContentPartType.Text, text: "matchingterm here" }],
        );
      assert.isTrue(startConversationResult1.success);
      await waitForConversationProcessing(
        backend,
        startConversationResult1.data.id,
      );
      const startConversationResult2 =
        await backend.assistants.startConversation(
          AssistantName.Factotum,
          ConversationFormat.Text,
          [{ type: MessageContentPartType.Text, text: "different content" }],
        );
      assert.isTrue(startConversationResult2.success);
      await waitForConversationProcessing(
        backend,
        startConversationResult2.data.id,
      );

      // Exercise
      const searchResult = await backend.assistants.searchConversations(
        "matchingterm",
        { limit: 20 },
      );

      // Verify
      assert.isTrue(searchResult.success);
      expect(searchResult.data).toHaveLength(1);
      expect(searchResult.data[0]!.match.id).toEqual(
        startConversationResult1.data.id,
      );
    });

    it("success: respects limit parameter", async () => {
      // Setup SUT
      const { backend } = deps();
      const startConversationResult1 =
        await backend.assistants.startConversation(
          AssistantName.Factotum,
          ConversationFormat.Text,
          [{ type: MessageContentPartType.Text, text: "limitterm one" }],
        );
      assert.isTrue(startConversationResult1.success);
      await waitForConversationProcessing(
        backend,
        startConversationResult1.data.id,
      );
      const startConversationResult2 =
        await backend.assistants.startConversation(
          AssistantName.Factotum,
          ConversationFormat.Text,
          [{ type: MessageContentPartType.Text, text: "limitterm two" }],
        );
      assert.isTrue(startConversationResult2.success);
      await waitForConversationProcessing(
        backend,
        startConversationResult2.data.id,
      );
      const startConversationResult3 =
        await backend.assistants.startConversation(
          AssistantName.Factotum,
          ConversationFormat.Text,
          [{ type: MessageContentPartType.Text, text: "limitterm three" }],
        );
      assert.isTrue(startConversationResult3.success);
      await waitForConversationProcessing(
        backend,
        startConversationResult3.data.id,
      );

      // Exercise
      const searchResult = await backend.assistants.searchConversations(
        "limitterm",
        { limit: 2 },
      );

      // Verify
      assert.isTrue(searchResult.success);
      expect(searchResult.data).toHaveLength(2);
    });
  });
});

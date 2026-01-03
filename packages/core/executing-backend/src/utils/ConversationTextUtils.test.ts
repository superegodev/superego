import { MessageContentPartType, MessageRole } from "@superego/backend";
import { describe, expect, it } from "vitest";
import ConversationTextUtils from "./ConversationTextUtils.js";

describe("extractTextChunks", () => {
  describe("title extraction", () => {
    it("returns title in array when title is provided", () => {
      // Exercise
      const textChunks = ConversationTextUtils.extractTextChunks(
        "My Title",
        [],
      );

      // Verify
      expect(textChunks.title).toEqual(["My Title"]);
    });

    it("returns empty array when title is null", () => {
      // Exercise
      const textChunks = ConversationTextUtils.extractTextChunks(null, []);

      // Verify
      expect(textChunks.title).toEqual([]);
    });
  });

  describe("message extraction", () => {
    it("extracts text from User messages", () => {
      // Exercise
      const textChunks = ConversationTextUtils.extractTextChunks(null, [
        {
          role: MessageRole.User,
          content: [
            { type: MessageContentPartType.Text, text: "Hello" },
            { type: MessageContentPartType.Text, text: "World" },
          ],
          createdAt: new Date(),
        },
      ]);

      // Verify
      expect(textChunks.messages).toEqual(["Hello", "World"]);
    });

    it("filters out non-text parts from User messages", () => {
      // Exercise
      const textChunks = ConversationTextUtils.extractTextChunks(null, [
        {
          role: MessageRole.User,
          content: [
            { type: MessageContentPartType.Text, text: "Hello" },
            {
              type: MessageContentPartType.File,
              file: {
                id: "file-1",
                name: "doc.pdf",
                mimeType: "application/pdf",
              },
            },
            {
              type: MessageContentPartType.Audio,
              audio: { content: new Uint8Array(), contentType: "audio/wav" },
            },
          ],
          createdAt: new Date(),
        },
      ]);

      // Verify
      expect(textChunks.messages).toEqual(["Hello"]);
    });

    it("extracts text from ContentAssistant messages", () => {
      // Exercise
      const textChunks = ConversationTextUtils.extractTextChunks(null, [
        {
          role: MessageRole.Assistant,
          content: [
            { type: MessageContentPartType.Text, text: "Response 1" },
            { type: MessageContentPartType.Text, text: "Response 2" },
          ],
          createdAt: new Date(),
        },
      ]);

      // Verify
      expect(textChunks.messages).toEqual(["Response 1", "Response 2"]);
    });

    it("returns empty array for ToolCallAssistant messages (no content)", () => {
      // Exercise
      const textChunks = ConversationTextUtils.extractTextChunks(null, [
        {
          role: MessageRole.Assistant,
          toolCalls: [{ id: "call-1", tool: "someTool", input: {} }],
          createdAt: new Date(),
        },
      ]);

      // Verify
      expect(textChunks.messages).toEqual([]);
    });

    it("ignores Developer messages", () => {
      // Exercise
      const textChunks = ConversationTextUtils.extractTextChunks(null, [
        {
          role: MessageRole.Developer,
          content: [{ type: MessageContentPartType.Text, text: "System text" }],
        },
      ]);

      // Verify
      expect(textChunks.messages).toEqual([]);
    });

    it("ignores UserContext messages", () => {
      // Exercise
      const textChunks = ConversationTextUtils.extractTextChunks(null, [
        {
          role: MessageRole.UserContext,
          content: [
            { type: MessageContentPartType.Text, text: "Context text" },
          ],
        },
      ]);

      // Verify
      expect(textChunks.messages).toEqual([]);
    });

    it("ignores Tool messages", () => {
      // Exercise
      const textChunks = ConversationTextUtils.extractTextChunks(null, [
        {
          role: MessageRole.Tool,
          toolResults: [],
          createdAt: new Date(),
        },
      ]);

      // Verify
      expect(textChunks.messages).toEqual([]);
    });

    it("extracts text from mixed message types", () => {
      // Exercise
      const textChunks = ConversationTextUtils.extractTextChunks(null, [
        {
          role: MessageRole.Developer,
          content: [{ type: MessageContentPartType.Text, text: "Dev text" }],
        },
        {
          role: MessageRole.User,
          content: [
            { type: MessageContentPartType.Text, text: "User question" },
          ],
          createdAt: new Date(),
        },
        {
          role: MessageRole.Assistant,
          content: [
            { type: MessageContentPartType.Text, text: "Assistant reply" },
          ],
          createdAt: new Date(),
        },
        {
          role: MessageRole.Tool,
          toolResults: [],
          createdAt: new Date(),
        },
        {
          role: MessageRole.User,
          content: [{ type: MessageContentPartType.Text, text: "Follow up" }],
          createdAt: new Date(),
        },
      ]);

      // Verify
      expect(textChunks.messages).toEqual([
        "User question",
        "Assistant reply",
        "Follow up",
      ]);
    });

    it("returns empty messages array for empty messages input", () => {
      // Exercise
      const textChunks = ConversationTextUtils.extractTextChunks(null, []);

      // Verify
      expect(textChunks.messages).toEqual([]);
    });
  });

  describe("combined title and messages", () => {
    it("returns both title and messages when provided", () => {
      // Exercise
      const textChunks = ConversationTextUtils.extractTextChunks(
        "Conversation Title",
        [
          {
            role: MessageRole.User,
            content: [{ type: MessageContentPartType.Text, text: "Question" }],
            createdAt: new Date(),
          },
        ],
      );

      // Verify
      expect(textChunks).toEqual({
        title: ["Conversation Title"],
        messages: ["Question"],
      });
    });
  });
});

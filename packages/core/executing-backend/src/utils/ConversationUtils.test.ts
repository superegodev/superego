import { MessageRole, ToolName } from "@superego/backend";
import { describe, expect, it } from "vitest";
import ConversationUtils from "./ConversationUtils.js";

describe("lastResponseHadSideEffects", () => {
  it("true when the last response included one or more CreateDocument calls", () => {
    // Exercise
    const messages = [
      { role: MessageRole.User },
      { role: MessageRole.Assistant },
      {
        role: MessageRole.Tool,
        toolResults: [
          {
            tool: ToolName.CreateDocument,
            toolCallId: "toolCallId",
            output: { success: true, data: {} as any, error: null },
          },
        ],
      },
      { role: MessageRole.Assistant },
    ];
    const hadSideEffects = ConversationUtils.lastResponseHadSideEffects(
      messages as any,
    );

    // Verify
    expect(hadSideEffects).toEqual(true);
  });

  it("true when the last response included one or more CreateNewDocumentVersion calls", () => {
    // Exercise
    const messages = [
      { role: MessageRole.User },
      { role: MessageRole.Assistant },
      {
        role: MessageRole.Tool,
        toolResults: [
          {
            tool: ToolName.CreateNewDocumentVersion,
            toolCallId: "toolCallId",
            output: { success: true, data: {} as any, error: null },
          },
        ],
      },
      { role: MessageRole.Assistant },
    ];
    const hadSideEffects = ConversationUtils.lastResponseHadSideEffects(
      messages as any,
    );

    // Verify
    expect(hadSideEffects).toEqual(true);
  });

  it("false otherwise", () => {
    // Exercise
    const messages = [
      { role: MessageRole.User },
      { role: MessageRole.Assistant },
      {
        role: MessageRole.Tool,
        toolResults: [
          {
            tool: ToolName.GetCollectionTypescriptSchema,
            toolCallId: "toolCallId",
            output: { success: true, data: {} as any, error: null },
          },
        ],
      },
      { role: MessageRole.Assistant },
    ];
    const hadSideEffects = ConversationUtils.lastResponseHadSideEffects(
      messages as any,
    );

    // Verify
    expect(hadSideEffects).toEqual(false);
  });
});

describe("sliceOffLastResponse", () => {
  describe("returns all messages until and including the last user message", () => {
    it("case: [..., Message.User]", () => {
      // Exercise
      const messages = [
        { role: MessageRole.User },
        { role: MessageRole.Assistant },
        {
          role: MessageRole.Tool,
          toolResults: [
            {
              tool: ToolName.GetCollectionTypescriptSchema,
              toolCallId: "toolCallId",
              output: { success: true, data: {} as any, error: null },
            },
          ],
        },
        { role: MessageRole.Assistant },
        { role: MessageRole.User },
      ];
      const slicedMessages = ConversationUtils.sliceOffLastResponse(
        messages as any,
      );

      // Verify
      expect(slicedMessages).toEqual(messages);
    });

    it("case: [..., Message.User, Message.Assistant]", () => {
      // Exercise
      const messages = [
        { role: MessageRole.User },
        { role: MessageRole.Assistant },
        {
          role: MessageRole.Tool,
          toolResults: [
            {
              tool: ToolName.GetCollectionTypescriptSchema,
              toolCallId: "toolCallId",
              output: { success: true, data: {} as any, error: null },
            },
          ],
        },
        { role: MessageRole.Assistant },
        { role: MessageRole.User },
        { role: MessageRole.Assistant },
      ];
      const slicedMessages = ConversationUtils.sliceOffLastResponse(
        messages as any,
      );

      // Verify
      expect(slicedMessages).toEqual(messages.slice(0, 5));
    });

    it("case: [..., Message.User, ..., Message.Assistant]", () => {
      // Exercise
      const messages = [
        { role: MessageRole.User },
        { role: MessageRole.Assistant },
        {
          role: MessageRole.Tool,
          toolResults: [
            {
              tool: ToolName.GetCollectionTypescriptSchema,
              toolCallId: "toolCallId",
              output: { success: true, data: {} as any, error: null },
            },
          ],
        },
        { role: MessageRole.Assistant },
      ];
      const slicedMessages = ConversationUtils.sliceOffLastResponse(
        messages as any,
      );

      // Verify
      expect(slicedMessages).toEqual(messages.slice(0, 1));
    });
  });
});

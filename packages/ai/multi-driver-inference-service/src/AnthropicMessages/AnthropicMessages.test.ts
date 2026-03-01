import {
  type InferenceOptions,
  type Message,
  MessageContentPartType,
  MessageRole,
  ReasoningEffort,
} from "@superego/backend";
import { InferenceService } from "@superego/executing-backend";
import { describe, expect, it } from "vitest";
import {
  type AnthropicMessages,
  extractTextFromResponse,
  fromAnthropicMessagesResponse,
  toAnthropicMessagesRequest,
} from "./AnthropicMessages.js";

const inferenceOptions: InferenceOptions<"completion"> = {
  completion: {
    providerModelRef: {
      providerName: "providerName",
      modelId: "modelId",
    },
    reasoningEffort: ReasoningEffort.Medium,
  },
  transcription: null,
  fileInspection: null,
};

describe("toAnthropicMessagesRequest", () => {
  it("converts messages and tools into a request", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Hello" }],
        createdAt: new Date(),
      },
    ];
    const tools: InferenceService.Tool[] = [
      {
        type: InferenceService.ToolType.Function,
        name: "get_weather",
        description: "Get weather info",
        inputSchema: {
          type: "object",
          properties: { city: { type: "string" } },
        },
      },
    ];
    const result = toAnthropicMessagesRequest(
      "claude-opus-4-6",
      messages,
      tools,
      null,
    );

    // Verify
    expect(result).toEqual({
      model: "claude-opus-4-6",
      max_tokens: 16384,
      system: undefined,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: "Hello" }],
        },
      ],
      tools: [
        {
          name: "get_weather",
          description: "Get weather info",
          input_schema: {
            type: "object",
            properties: { city: { type: "string" } },
          },
        },
      ],
      thinking: undefined,
      stream: false,
    });
  });

  it("sets thinking when reasoningEffort is provided", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Hello" }],
        createdAt: new Date(),
      },
    ];
    const result = toAnthropicMessagesRequest(
      "claude-opus-4-6",
      messages,
      [],
      ReasoningEffort.High,
    );

    // Verify
    expect(result.thinking).toEqual({
      type: "enabled",
      budget_tokens: 10000,
    });
  });

  it("sets max_tokens to base + budget when thinking is enabled", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Hello" }],
        createdAt: new Date(),
      },
    ];
    const result = toAnthropicMessagesRequest(
      "claude-opus-4-6",
      messages,
      [],
      ReasoningEffort.High,
    );

    // Verify
    expect(result.max_tokens).toBe(16384 + 10000);
  });

  it("sets thinking to undefined when reasoningEffort is null", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Hello" }],
        createdAt: new Date(),
      },
    ];
    const result = toAnthropicMessagesRequest(
      "claude-opus-4-6",
      messages,
      [],
      null,
    );

    // Verify
    expect(result.thinking).toBeUndefined();
  });

  it("sets tools to undefined when empty", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Hello" }],
        createdAt: new Date(),
      },
    ];
    const result = toAnthropicMessagesRequest(
      "claude-opus-4-6",
      messages,
      [],
      null,
    );

    // Verify
    expect(result.tools).toBeUndefined();
  });

  it("extracts developer message to system parameter", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.Developer,
        content: [
          { type: MessageContentPartType.Text, text: "You are helpful." },
        ],
      },
      {
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Hi" }],
        createdAt: new Date(),
      },
    ];
    const result = toAnthropicMessagesRequest(
      "claude-opus-4-6",
      messages,
      [],
      null,
    );

    // Verify
    expect(result.system).toEqual([{ type: "text", text: "You are helpful." }]);
    expect(result.messages).toEqual([
      { role: "user", content: [{ type: "text", text: "Hi" }] },
    ]);
  });

  it("converts user message with text content", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Hi there" }],
        createdAt: new Date(),
      },
    ];
    const result = toAnthropicMessagesRequest(
      "claude-opus-4-6",
      messages,
      [],
      null,
    );

    // Verify
    expect(result.messages).toEqual([
      {
        role: "user",
        content: [{ type: "text", text: "Hi there" }],
      },
    ]);
  });

  it("converts user context message to user role", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.UserContext,
        content: [{ type: MessageContentPartType.Text, text: "Context info" }],
      },
    ];
    const result = toAnthropicMessagesRequest(
      "claude-opus-4-6",
      messages,
      [],
      null,
    );

    // Verify
    expect(result.messages).toEqual([
      {
        role: "user",
        content: [{ type: "text", text: "Context info" }],
      },
    ]);
  });

  it("converts user message with image file", () => {
    // Exercise
    const fileBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
    const messages: Message[] = [
      {
        role: MessageRole.User,
        content: [
          {
            type: MessageContentPartType.File,
            file: {
              name: "photo.png",
              mimeType: "image/png",
              content: fileBytes,
            },
          },
        ],
        createdAt: new Date(),
      },
    ];
    const result = toAnthropicMessagesRequest(
      "claude-opus-4-6",
      messages,
      [],
      null,
    );

    // Verify
    const userMessage = result.messages[0]!;
    expect(userMessage.content[0]).toEqual({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/png",
        data: Buffer.from(fileBytes).toString("base64"),
      },
    });
  });

  it("converts user message with PDF file as document", () => {
    // Exercise
    const fileBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    const messages: Message[] = [
      {
        role: MessageRole.User,
        content: [
          {
            type: MessageContentPartType.File,
            file: {
              name: "doc.pdf",
              mimeType: "application/pdf",
              content: fileBytes,
            },
          },
        ],
        createdAt: new Date(),
      },
    ];
    const result = toAnthropicMessagesRequest(
      "claude-opus-4-6",
      messages,
      [],
      null,
    );

    // Verify
    const userMessage = result.messages[0]!;
    expect(userMessage.content[0]).toEqual({
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: Buffer.from(fileBytes).toString("base64"),
      },
    });
  });

  it("filters out file ref without content", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.User,
        content: [
          {
            type: MessageContentPartType.File,
            file: {
              id: "file-1",
              name: "doc.pdf",
              mimeType: "application/pdf",
            },
          },
        ],
        createdAt: new Date(),
      },
    ];
    const result = toAnthropicMessagesRequest(
      "claude-opus-4-6",
      messages,
      [],
      null,
    );

    // Verify
    const userMessage = result.messages[0]!;
    expect(userMessage.content).toEqual([]);
  });

  it("throws on audio content", () => {
    // Exercise
    const audioBytes = new Uint8Array([1, 2, 3]);
    const messages: Message[] = [
      {
        role: MessageRole.User,
        content: [
          {
            type: MessageContentPartType.Audio,
            audio: { content: audioBytes, contentType: "audio/wav" },
          },
        ],
        createdAt: new Date(),
      },
    ];

    // Verify
    expect(() =>
      toAnthropicMessagesRequest("claude-opus-4-6", messages, [], null),
    ).toThrow(
      "Audio content is not supported by the Anthropic Messages driver.",
    );
  });

  it("converts tool message to tool_result blocks in user message", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.Tool,
        toolResults: [
          {
            tool: "get_weather",
            toolCallId: "call-1",
            output: { success: true, data: { temp: 72 } } as any,
          },
          {
            tool: "get_time",
            toolCallId: "call-2",
            output: { success: true, data: { time: "12:00" } } as any,
          },
        ],
        createdAt: new Date(),
      },
    ];
    const result = toAnthropicMessagesRequest(
      "claude-opus-4-6",
      messages,
      [],
      null,
    );

    // Verify
    expect(result.messages).toEqual([
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "call-1",
            content: JSON.stringify({ success: true, data: { temp: 72 } }),
          },
          {
            type: "tool_result",
            tool_use_id: "call-2",
            content: JSON.stringify({
              success: true,
              data: { time: "12:00" },
            }),
          },
        ],
      },
    ]);
  });

  it("converts tool call assistant message to tool_use blocks", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.Assistant,
        toolCalls: [
          { id: "call-1", tool: "get_weather", input: { city: "NYC" } },
        ],
        reasoning: {},
        inferenceOptions,
        generationStats: {
          timeTaken: 0,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
        },
        createdAt: new Date(),
      },
    ];
    const result = toAnthropicMessagesRequest(
      "claude-opus-4-6",
      messages,
      [],
      null,
    );

    // Verify
    expect(result.messages).toEqual([
      {
        role: "assistant",
        content: [
          {
            type: "tool_use",
            id: "call-1",
            name: "get_weather",
            input: { city: "NYC" },
          },
        ],
      },
    ]);
  });

  it("converts content assistant message to assistant role with text block", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.Assistant,
        content: [
          { type: MessageContentPartType.Text, text: "Line 1" },
          { type: MessageContentPartType.Text, text: "Line 2" },
        ],
        reasoning: {},
        inferenceOptions,
        generationStats: {
          timeTaken: 0,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
        },
        createdAt: new Date(),
      },
    ];
    const result = toAnthropicMessagesRequest(
      "claude-opus-4-6",
      messages,
      [],
      null,
    );

    // Verify
    expect(result.messages).toEqual([
      {
        role: "assistant",
        content: [{ type: "text", text: "Line 1\nLine 2" }],
      },
    ]);
  });

  it("merges consecutive same-role messages", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.UserContext,
        content: [{ type: MessageContentPartType.Text, text: "Context info" }],
      },
      {
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Hello" }],
        createdAt: new Date(),
      },
    ];
    const result = toAnthropicMessagesRequest(
      "claude-opus-4-6",
      messages,
      [],
      null,
    );

    // Verify
    expect(result.messages).toEqual([
      {
        role: "user",
        content: [
          { type: "text", text: "Context info" },
          { type: "text", text: "Hello" },
        ],
      },
    ]);
  });

  it("merges tool result and following user message", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.Tool,
        toolResults: [
          { tool: "search", toolCallId: "call-1", output: "result" as any },
        ],
        createdAt: new Date(),
      },
      {
        role: MessageRole.User,
        content: [
          { type: MessageContentPartType.Text, text: "Thanks, now do more" },
        ],
        createdAt: new Date(),
      },
    ];
    const result = toAnthropicMessagesRequest(
      "claude-opus-4-6",
      messages,
      [],
      null,
    );

    // Verify
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0]!.role).toBe("user");
    expect(result.messages[0]!.content).toEqual([
      {
        type: "tool_result",
        tool_use_id: "call-1",
        content: JSON.stringify("result"),
      },
      { type: "text", text: "Thanks, now do more" },
    ]);
  });

  it("passes back thinking for assistant messages after the last user message", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "First" }],
        createdAt: new Date(),
      },
      {
        role: MessageRole.Assistant,
        content: [{ type: MessageContentPartType.Text, text: "Old reply" }],
        reasoning: { content: "old-reasoning", contentSignature: "old-sig" },
        inferenceOptions,
        generationStats: {
          timeTaken: 0,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
        },
        createdAt: new Date(),
      },
      {
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Second" }],
        createdAt: new Date(),
      },
      {
        role: MessageRole.Assistant,
        toolCalls: [{ id: "call-1", tool: "search", input: { q: "test" } }],
        reasoning: { content: "new-reasoning", contentSignature: "new-sig" },
        inferenceOptions,
        generationStats: {
          timeTaken: 0,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
        },
        createdAt: new Date(),
      },
      {
        role: MessageRole.Tool,
        toolResults: [
          { tool: "search", toolCallId: "call-1", output: "result" as any },
        ],
        createdAt: new Date(),
      },
    ];
    const result = toAnthropicMessagesRequest(
      "claude-opus-4-6",
      messages,
      [],
      ReasoningEffort.High,
    );

    // Verify
    const oldAssistantMessage = result.messages.find(
      (message) =>
        message.role === "assistant" &&
        message.content.some(
          (block) => block.type === "text" && block.text === "Old reply",
        ),
    );
    expect(oldAssistantMessage).toBeDefined();
    const oldThinking = oldAssistantMessage!.content.filter(
      (block) => block.type === "thinking",
    );
    expect(oldThinking).toHaveLength(0);

    const newAssistantMessage = result.messages.find(
      (message) =>
        message.role === "assistant" &&
        message.content.some((block) => block.type === "tool_use"),
    );
    expect(newAssistantMessage).toBeDefined();
    const newThinking = newAssistantMessage!.content.filter(
      (block) => block.type === "thinking",
    );
    expect(newThinking).toHaveLength(1);
    expect(newThinking[0]).toEqual({
      type: "thinking",
      thinking: "new-reasoning",
      signature: "new-sig",
    });
  });

  it("does not pass back thinking for assistant messages before the last user message", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "First" }],
        createdAt: new Date(),
      },
      {
        role: MessageRole.Assistant,
        content: [{ type: MessageContentPartType.Text, text: "Reply" }],
        reasoning: { content: "old-reasoning", contentSignature: "old-sig" },
        inferenceOptions,
        generationStats: {
          timeTaken: 0,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
        },
        createdAt: new Date(),
      },
      {
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Second" }],
        createdAt: new Date(),
      },
    ];
    const result = toAnthropicMessagesRequest(
      "claude-opus-4-6",
      messages,
      [],
      ReasoningEffort.High,
    );

    // Verify
    const thinkingBlocks = result.messages.flatMap((message) =>
      message.content.filter((block) => block.type === "thinking"),
    );
    expect(thinkingBlocks).toHaveLength(0);
  });

  it("does not emit thinking blocks when reasoningEffort is null", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Hello" }],
        createdAt: new Date(),
      },
      {
        role: MessageRole.Assistant,
        content: [{ type: MessageContentPartType.Text, text: "Reply" }],
        reasoning: { content: "some reasoning", contentSignature: "sig-1" },
        inferenceOptions,
        generationStats: {
          timeTaken: 0,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
        },
        createdAt: new Date(),
      },
    ];
    const result = toAnthropicMessagesRequest(
      "claude-opus-4-6",
      messages,
      [],
      null,
    );

    // Verify
    const thinkingBlocks = result.messages.flatMap((message) =>
      message.content.filter((block) => block.type === "thinking"),
    );
    expect(thinkingBlocks).toHaveLength(0);
  });

  it("emits redacted_thinking blocks when reasoning has encrypted content", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Hello" }],
        createdAt: new Date(),
      },
      {
        role: MessageRole.Assistant,
        content: [{ type: MessageContentPartType.Text, text: "Reply" }],
        reasoning: { encryptedContent: "encrypted-data" },
        inferenceOptions,
        generationStats: {
          timeTaken: 0,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
        },
        createdAt: new Date(),
      },
    ];
    const result = toAnthropicMessagesRequest(
      "claude-opus-4-6",
      messages,
      [],
      ReasoningEffort.High,
    );

    // Verify
    const redactedThinkingBlocks = result.messages.flatMap((message) =>
      message.content.filter((block) => block.type === "redacted_thinking"),
    );
    expect(redactedThinkingBlocks).toEqual([
      { type: "redacted_thinking", data: "encrypted-data" },
    ]);
  });

  it("passes back thinking for content assistant messages after the last user message", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Hello" }],
        createdAt: new Date(),
      },
      {
        role: MessageRole.Assistant,
        content: [{ type: MessageContentPartType.Text, text: "Reply" }],
        reasoning: { content: "some reasoning", contentSignature: "sig-1" },
        inferenceOptions,
        generationStats: {
          timeTaken: 0,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
        },
        createdAt: new Date(),
      },
    ];
    const result = toAnthropicMessagesRequest(
      "claude-opus-4-6",
      messages,
      [],
      ReasoningEffort.High,
    );

    // Verify
    const assistantMessage = result.messages.find(
      (message) => message.role === "assistant",
    );
    expect(assistantMessage).toBeDefined();
    const thinkingBlocks = assistantMessage!.content.filter(
      (block) => block.type === "thinking",
    );
    expect(thinkingBlocks).toHaveLength(1);
    expect(thinkingBlocks[0]).toEqual({
      type: "thinking",
      thinking: "some reasoning",
      signature: "sig-1",
    });
  });

  it("maps each reasoning effort to the correct budget", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Hello" }],
        createdAt: new Date(),
      },
    ];

    // Verify
    expect(
      toAnthropicMessagesRequest("m", messages, [], ReasoningEffort.Low)
        .thinking,
    ).toEqual({ type: "enabled", budget_tokens: 1024 });
    expect(
      toAnthropicMessagesRequest("m", messages, [], ReasoningEffort.Medium)
        .thinking,
    ).toEqual({ type: "enabled", budget_tokens: 4096 });
    expect(
      toAnthropicMessagesRequest("m", messages, [], ReasoningEffort.High)
        .thinking,
    ).toEqual({ type: "enabled", budget_tokens: 10000 });
    expect(
      toAnthropicMessagesRequest("m", messages, [], ReasoningEffort.XHigh)
        .thinking,
    ).toEqual({ type: "enabled", budget_tokens: 32000 });
  });
});

describe("fromAnthropicMessagesResponse", () => {
  it("returns tool call assistant when response has tool_use blocks", () => {
    // Exercise
    const response: AnthropicMessages.Response = {
      id: "msg-1",
      type: "message",
      role: "assistant",
      content: [
        {
          type: "tool_use",
          id: "toolu_1",
          name: "get_weather",
          input: { city: "NYC" },
        },
      ],
      stop_reason: "tool_use",
      usage: { input_tokens: 100, output_tokens: 50 },
    };
    const result = fromAnthropicMessagesResponse(
      response,
      inferenceOptions,
      1500,
    );

    // Verify
    expect(result).toEqual(
      expect.objectContaining({
        role: MessageRole.Assistant,
        toolCalls: [
          { id: "toolu_1", tool: "get_weather", input: { city: "NYC" } },
        ],
        inferenceOptions,
        generationStats: {
          timeTaken: 1500,
          inputTokens: 100,
          outputTokens: 50,
          totalTokens: 150,
        },
      }),
    );
  });

  it("returns content assistant when response has text blocks", () => {
    // Exercise
    const response: AnthropicMessages.Response = {
      id: "msg-1",
      type: "message",
      role: "assistant",
      content: [{ type: "text", text: "Hello!" }],
      stop_reason: "end_turn",
      usage: { input_tokens: 80, output_tokens: 20 },
    };
    const result = fromAnthropicMessagesResponse(
      response,
      inferenceOptions,
      1200,
    );

    // Verify
    expect(result).toEqual(
      expect.objectContaining({
        role: MessageRole.Assistant,
        content: [{ type: MessageContentPartType.Text, text: "Hello!" }],
        inferenceOptions,
        generationStats: {
          timeTaken: 1200,
          inputTokens: 80,
          outputTokens: 20,
          totalTokens: 100,
        },
      }),
    );
  });

  it("prioritizes tool_use over text when response has both", () => {
    // Exercise
    const response: AnthropicMessages.Response = {
      id: "msg-1",
      type: "message",
      role: "assistant",
      content: [
        { type: "text", text: "Thinking..." },
        {
          type: "tool_use",
          id: "toolu_1",
          name: "search",
          input: { q: "test" },
        },
      ],
      stop_reason: "tool_use",
      usage: { input_tokens: 50, output_tokens: 30 },
    };
    const result = fromAnthropicMessagesResponse(
      response,
      inferenceOptions,
      800,
    );

    // Verify
    expect(result).toEqual(
      expect.objectContaining({
        role: MessageRole.Assistant,
        toolCalls: [{ id: "toolu_1", tool: "search", input: { q: "test" } }],
      }),
    );
    expect("toolCalls" in result).toBe(true);
    expect("content" in result).toBe(false);
  });

  it("computes totalTokens from input + output", () => {
    // Exercise
    const response: AnthropicMessages.Response = {
      id: "msg-1",
      type: "message",
      role: "assistant",
      content: [{ type: "text", text: "Hello!" }],
      stop_reason: "end_turn",
      usage: { input_tokens: 123, output_tokens: 456 },
    };
    const result = fromAnthropicMessagesResponse(
      response,
      inferenceOptions,
      1000,
    );

    // Verify
    expect(result.generationStats.totalTokens).toBe(579);
  });

  it("extracts reasoning from thinking blocks", () => {
    // Exercise
    const response: AnthropicMessages.Response = {
      id: "msg-1",
      type: "message",
      role: "assistant",
      content: [
        {
          type: "thinking",
          thinking: "The model reasoned...",
          signature: "sig-123",
        },
        { type: "text", text: "Hello!" },
      ],
      stop_reason: "end_turn",
      usage: { input_tokens: 80, output_tokens: 20 },
    };
    const result = fromAnthropicMessagesResponse(
      response,
      inferenceOptions,
      1200,
    );

    // Verify
    expect(result.reasoning).toEqual({
      content: "The model reasoned...",
      contentSignature: "sig-123",
    });
  });

  it("extracts encrypted reasoning from redacted_thinking blocks", () => {
    // Exercise
    const response: AnthropicMessages.Response = {
      id: "msg-1",
      type: "message",
      role: "assistant",
      content: [
        {
          type: "redacted_thinking",
          data: "encrypted-thinking-data",
        },
        { type: "text", text: "Hello!" },
      ],
      stop_reason: "end_turn",
      usage: { input_tokens: 80, output_tokens: 20 },
    };
    const result = fromAnthropicMessagesResponse(
      response,
      inferenceOptions,
      1200,
    );

    // Verify
    expect(result.reasoning).toEqual({
      encryptedContent: "encrypted-thinking-data",
    });
  });

  it("returns empty reasoning when no thinking blocks", () => {
    // Exercise
    const response: AnthropicMessages.Response = {
      id: "msg-1",
      type: "message",
      role: "assistant",
      content: [{ type: "text", text: "Hello!" }],
      stop_reason: "end_turn",
      usage: { input_tokens: 80, output_tokens: 20 },
    };
    const result = fromAnthropicMessagesResponse(
      response,
      inferenceOptions,
      1200,
    );

    // Verify
    expect(result.reasoning).toEqual({});
  });

  it("joins text from multiple text blocks", () => {
    // Exercise
    const response: AnthropicMessages.Response = {
      id: "msg-1",
      type: "message",
      role: "assistant",
      content: [
        { type: "text", text: "Part 1" },
        { type: "text", text: "Part 2" },
      ],
      stop_reason: "end_turn",
      usage: { input_tokens: 60, output_tokens: 40 },
    };
    const result = fromAnthropicMessagesResponse(
      response,
      inferenceOptions,
      900,
    );

    // Verify
    expect(result).toEqual(
      expect.objectContaining({
        content: [
          { type: MessageContentPartType.Text, text: "Part 1\nPart 2" },
        ],
      }),
    );
  });

  it("extracts reasoning from thinking blocks alongside tool_use", () => {
    // Exercise
    const response: AnthropicMessages.Response = {
      id: "msg-1",
      type: "message",
      role: "assistant",
      content: [
        {
          type: "thinking",
          thinking: "I should search for this",
          signature: "sig-abc",
        },
        {
          type: "tool_use",
          id: "toolu_1",
          name: "search",
          input: { q: "test" },
        },
      ],
      stop_reason: "tool_use",
      usage: { input_tokens: 100, output_tokens: 60 },
    };
    const result = fromAnthropicMessagesResponse(
      response,
      inferenceOptions,
      900,
    );

    // Verify
    expect(result).toEqual(
      expect.objectContaining({
        role: MessageRole.Assistant,
        toolCalls: [{ id: "toolu_1", tool: "search", input: { q: "test" } }],
        reasoning: {
          content: "I should search for this",
          contentSignature: "sig-abc",
        },
        generationStats: {
          timeTaken: 900,
          inputTokens: 100,
          outputTokens: 60,
          totalTokens: 160,
        },
      }),
    );
  });

  it("does not include cost in generationStats", () => {
    // Exercise
    const response: AnthropicMessages.Response = {
      id: "msg-1",
      type: "message",
      role: "assistant",
      content: [{ type: "text", text: "Hello!" }],
      stop_reason: "end_turn",
      usage: { input_tokens: 80, output_tokens: 20 },
    };
    const result = fromAnthropicMessagesResponse(
      response,
      inferenceOptions,
      1000,
    );

    // Verify
    expect(result.generationStats.cost).toBeUndefined();
  });
});

describe("extractTextFromResponse", () => {
  it("extracts text from text content blocks", () => {
    // Exercise
    const response: AnthropicMessages.Response = {
      id: "msg-1",
      type: "message",
      role: "assistant",
      content: [
        { type: "text", text: "Hello" },
        { type: "text", text: "World" },
      ],
      stop_reason: "end_turn",
      usage: { input_tokens: 0, output_tokens: 0 },
    };
    const result = extractTextFromResponse(response);

    // Verify
    expect(result).toBe("Hello\nWorld");
  });

  it("returns empty string when no text blocks", () => {
    // Exercise
    const response: AnthropicMessages.Response = {
      id: "msg-1",
      type: "message",
      role: "assistant",
      content: [
        {
          type: "tool_use",
          id: "toolu_1",
          name: "search",
          input: {},
        },
      ],
      stop_reason: "tool_use",
      usage: { input_tokens: 0, output_tokens: 0 },
    };
    const result = extractTextFromResponse(response);

    // Verify
    expect(result).toBe("");
  });
});

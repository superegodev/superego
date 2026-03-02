import {
  type InferenceOptions,
  type Message,
  MessageContentPartType,
  MessageRole,
  ReasoningEffort,
} from "@superego/backend";
import { InferenceService } from "@superego/executing-backend";
import { Id } from "@superego/shared-utils";
import { describe, expect, it } from "vitest";
import {
  extractTextFromResponse,
  fromResponsesResponse,
  type Responses,
  toResponsesRequest,
} from "./Responses.js";

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

describe("toResponsesRequest", () => {
  it("converts messages and tools into a request", () => {
    // Exercise
    const messages: Message[] = [
      {
        id: Id.generate.message(),
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
    const result = toResponsesRequest("gpt-oss-120b", messages, tools, null);

    // Verify
    expect(result).toEqual({
      model: "gpt-oss-120b",
      input: [
        {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: "Hello" }],
        },
      ],
      tools: [
        {
          type: "function",
          name: "get_weather",
          description: "Get weather info",
          parameters: {
            type: "object",
            properties: { city: { type: "string" } },
          },
        },
      ],
      stream: false,
    });
  });

  it("sets reasoning when reasoningEffort is provided", () => {
    // Exercise
    const messages: Message[] = [
      {
        id: Id.generate.message(),
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Hello" }],
        createdAt: new Date(),
      },
    ];
    const result = toResponsesRequest(
      "gpt-oss-120b",
      messages,
      [],
      ReasoningEffort.High,
    );

    // Verify
    expect(result.reasoning).toEqual({ effort: "high", summary: "auto" });
  });

  it("sets reasoning to undefined when reasoningEffort is null", () => {
    // Exercise
    const messages: Message[] = [
      {
        id: Id.generate.message(),
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Hello" }],
        createdAt: new Date(),
      },
    ];
    const result = toResponsesRequest("gpt-oss-120b", messages, [], null);

    // Verify
    expect(result.reasoning).toBeUndefined();
  });

  it("sets tools to undefined when empty", () => {
    // Exercise
    const messages: Message[] = [
      {
        id: Id.generate.message(),
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Hello" }],
        createdAt: new Date(),
      },
    ];
    const result = toResponsesRequest("gpt-oss-120b", messages, [], null);

    // Verify
    expect(result.tools).toBeUndefined();
  });

  it("converts developer message to system role", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.Developer,
        content: [
          { type: MessageContentPartType.Text, text: "You are helpful." },
        ],
      },
    ];
    const result = toResponsesRequest("gpt-oss-120b", messages, [], null);

    // Verify
    expect(result.input).toEqual([
      { type: "message", role: "system", content: "You are helpful." },
    ]);
  });

  it("converts user message with text content", () => {
    // Exercise
    const messages: Message[] = [
      {
        id: Id.generate.message(),
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Hi there" }],
        createdAt: new Date(),
      },
    ];
    const result = toResponsesRequest("gpt-oss-120b", messages, [], null);

    // Verify
    expect(result.input).toEqual([
      {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: "Hi there" }],
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
    const result = toResponsesRequest("gpt-oss-120b", messages, [], null);

    // Verify
    expect(result.input).toEqual([
      {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: "Context info" }],
      },
    ]);
  });

  it("converts user message with audio content", () => {
    // Exercise
    const audioBytes = new Uint8Array([1, 2, 3]);
    const messages: Message[] = [
      {
        id: Id.generate.message(),
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
    const result = toResponsesRequest("gpt-oss-120b", messages, [], null);

    // Verify
    const inputItem = result.input[0] as Responses.MessageItem;
    const audioPart = (inputItem.content as Responses.InputContentPart[])[0];
    expect(audioPart).toEqual({
      type: "input_audio",
      input_audio: {
        data: Buffer.from(audioBytes).toString("base64"),
        format: "wav",
      },
    });
  });

  it("converts user message with image file", () => {
    // Exercise
    const fileBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
    const messages: Message[] = [
      {
        id: Id.generate.message(),
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
    const result = toResponsesRequest("gpt-oss-120b", messages, [], null);

    // Verify
    const inputItem = result.input[0] as Responses.MessageItem;
    const filePart = (inputItem.content as Responses.InputContentPart[])[0];
    expect(filePart).toEqual({
      type: "input_image",
      image_url: `data:image/png;base64,${Buffer.from(fileBytes).toString("base64")}`,
    });
  });

  it("converts user message with non-image file", () => {
    // Exercise
    const fileBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    const messages: Message[] = [
      {
        id: Id.generate.message(),
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
    const result = toResponsesRequest("gpt-oss-120b", messages, [], null);

    // Verify
    const inputItem = result.input[0] as Responses.MessageItem;
    const filePart = (inputItem.content as Responses.InputContentPart[])[0];
    expect(filePart).toEqual({
      type: "input_file",
      filename: "doc.pdf",
      file_data: `data:application/pdf;base64,${Buffer.from(fileBytes).toString("base64")}`,
    });
  });

  it("filters out file ref without content", () => {
    // Exercise
    const messages: Message[] = [
      {
        id: Id.generate.message(),
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
    const result = toResponsesRequest("gpt-oss-120b", messages, [], null);

    // Verify
    const inputItem = result.input[0] as Responses.MessageItem;
    expect(inputItem.content).toEqual([]);
  });

  it("converts tool message to function call outputs", () => {
    // Exercise
    const messages: Message[] = [
      {
        id: Id.generate.message(),
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
    const result = toResponsesRequest("gpt-oss-120b", messages, [], null);

    // Verify
    expect(result.input).toEqual([
      {
        type: "function_call_output",
        call_id: "call-1",
        output: JSON.stringify({ success: true, data: { temp: 72 } }),
      },
      {
        type: "function_call_output",
        call_id: "call-2",
        output: JSON.stringify({ success: true, data: { time: "12:00" } }),
      },
    ]);
  });

  it("converts tool call assistant message to function calls", () => {
    // Exercise
    const messages: Message[] = [
      {
        id: Id.generate.message(),
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
    const result = toResponsesRequest("gpt-oss-120b", messages, [], null);

    // Verify
    expect(result.input).toEqual([
      {
        type: "function_call",
        call_id: "call-1",
        name: "get_weather",
        arguments: JSON.stringify({ city: "NYC" }),
      },
    ]);
  });

  it("converts content assistant message to assistant role", () => {
    // Exercise
    const messages: Message[] = [
      {
        id: Id.generate.message(),
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
    const result = toResponsesRequest("gpt-oss-120b", messages, [], null);

    // Verify
    expect(result.input).toEqual([
      { type: "message", role: "assistant", content: "Line 1\nLine 2" },
    ]);
  });

  it("passes back reasoning for assistant messages after the last user message", () => {
    // Exercise
    const messages: Message[] = [
      {
        id: Id.generate.message(),
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "First" }],
        createdAt: new Date(),
      },
      {
        id: Id.generate.message(),
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
        id: Id.generate.message(),
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Second" }],
        createdAt: new Date(),
      },
      {
        id: Id.generate.message(),
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
        id: Id.generate.message(),
        role: MessageRole.Tool,
        toolResults: [
          { tool: "search", toolCallId: "call-1", output: "result" as any },
        ],
        createdAt: new Date(),
      },
    ];
    const result = toResponsesRequest(
      "gpt-oss-120b",
      messages,
      [],
      ReasoningEffort.High,
    );

    // Verify
    const oldAssistantItems = result.input.filter(
      (item) =>
        item.type === "message" &&
        (item as Responses.MessageItem).role === "assistant",
    );
    expect(oldAssistantItems).toHaveLength(1);
    const reasoningItems = result.input.filter(
      (item) => item.type === "reasoning",
    );
    expect(reasoningItems).toHaveLength(1);
    expect(reasoningItems[0]).toEqual(
      expect.objectContaining({
        type: "reasoning",
        content: [{ type: "reasoning_text", text: "new-reasoning" }],
        signature: "new-sig",
      }),
    );
  });

  it("does not pass back reasoning for assistant messages before the last user message", () => {
    // Exercise
    const messages: Message[] = [
      {
        id: Id.generate.message(),
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "First" }],
        createdAt: new Date(),
      },
      {
        id: Id.generate.message(),
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
        id: Id.generate.message(),
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Second" }],
        createdAt: new Date(),
      },
    ];
    const result = toResponsesRequest(
      "gpt-oss-120b",
      messages,
      [],
      ReasoningEffort.High,
    );

    // Verify
    const reasoningItems = result.input.filter(
      (item) => item.type === "reasoning",
    );
    expect(reasoningItems).toHaveLength(0);
  });

  it("does not emit reasoning input items when reasoningEffort is null", () => {
    // Exercise
    const messages: Message[] = [
      {
        id: Id.generate.message(),
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Hello" }],
        createdAt: new Date(),
      },
      {
        id: Id.generate.message(),
        role: MessageRole.Assistant,
        content: [{ type: MessageContentPartType.Text, text: "Reply" }],
        reasoning: { content: "some reasoning" },
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
    const result = toResponsesRequest("gpt-oss-120b", messages, [], null);

    // Verify
    const reasoningItems = result.input.filter(
      (item) => item.type === "reasoning",
    );
    expect(reasoningItems).toHaveLength(0);
  });

  it("passes back reasoning for content assistant messages after the last user message", () => {
    // Exercise
    const messages: Message[] = [
      {
        id: Id.generate.message(),
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Hello" }],
        createdAt: new Date(),
      },
      {
        id: Id.generate.message(),
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
    const result = toResponsesRequest(
      "gpt-oss-120b",
      messages,
      [],
      ReasoningEffort.High,
    );

    // Verify
    const reasoningItems = result.input.filter(
      (item) => item.type === "reasoning",
    );
    expect(reasoningItems).toHaveLength(1);
    expect(reasoningItems[0]).toEqual(
      expect.objectContaining({
        type: "reasoning",
        content: [{ type: "reasoning_text", text: "some reasoning" }],
        signature: "sig-1",
      }),
    );
    const assistantItems = result.input.filter(
      (item) =>
        item.type === "message" &&
        (item as Responses.MessageItem).role === "assistant",
    );
    expect(assistantItems).toHaveLength(1);
  });

  it("passes back reasoning with encrypted content", () => {
    // Exercise
    const messages: Message[] = [
      {
        id: Id.generate.message(),
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Hello" }],
        createdAt: new Date(),
      },
      {
        id: Id.generate.message(),
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
    const result = toResponsesRequest(
      "gpt-oss-120b",
      messages,
      [],
      ReasoningEffort.High,
    );

    // Verify
    const reasoningItems = result.input.filter(
      (item) => item.type === "reasoning",
    );
    expect(reasoningItems).toHaveLength(1);
    expect(reasoningItems[0]).toEqual(
      expect.objectContaining({
        type: "reasoning",
        encrypted_content: "encrypted-data",
      }),
    );
  });

  it("does not emit reasoning input item when reasoning is empty", () => {
    // Exercise
    const messages: Message[] = [
      {
        id: Id.generate.message(),
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Hello" }],
        createdAt: new Date(),
      },
      {
        id: Id.generate.message(),
        role: MessageRole.Assistant,
        content: [{ type: MessageContentPartType.Text, text: "Reply" }],
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
    const result = toResponsesRequest(
      "gpt-oss-120b",
      messages,
      [],
      ReasoningEffort.High,
    );

    // Verify
    const reasoningItems = result.input.filter(
      (item) => item.type === "reasoning",
    );
    expect(reasoningItems).toHaveLength(0);
  });
});

describe("fromResponsesResponse", () => {
  it("returns tool call assistant when response has function calls", () => {
    // Exercise
    const response: Responses.Response = {
      id: "resp-1",
      output: [
        {
          type: "function_call",
          id: "fc-1",
          call_id: "call-1",
          name: "get_weather",
          arguments: JSON.stringify({ city: "NYC" }),
        },
      ],
      usage: { input_tokens: 100, output_tokens: 50, total_tokens: 150 },
    };
    const result = fromResponsesResponse(response, inferenceOptions, 1500);

    // Verify
    expect(result).toEqual(
      expect.objectContaining({
        role: MessageRole.Assistant,
        toolCalls: [
          { id: "call-1", tool: "get_weather", input: { city: "NYC" } },
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

  it("returns content assistant when response has text output", () => {
    // Exercise
    const response: Responses.Response = {
      id: "resp-1",
      output: [
        {
          type: "message",
          role: "assistant",
          content: [{ type: "output_text", text: "Hello!" }],
        },
      ],
      usage: { input_tokens: 80, output_tokens: 20, total_tokens: 100 },
    };
    const result = fromResponsesResponse(response, inferenceOptions, 1200);

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

  it("prioritizes function calls when response has mixed output", () => {
    // Exercise
    const response: Responses.Response = {
      id: "resp-1",
      output: [
        {
          type: "message",
          role: "assistant",
          content: [{ type: "output_text", text: "Thinking..." }],
        },
        {
          type: "function_call",
          id: "fc-1",
          call_id: "call-1",
          name: "search",
          arguments: JSON.stringify({ q: "test" }),
        },
      ],
      usage: { input_tokens: 50, output_tokens: 30, total_tokens: 80 },
    };
    const result = fromResponsesResponse(response, inferenceOptions, 800);

    // Verify
    expect(result).toEqual(
      expect.objectContaining({
        role: MessageRole.Assistant,
        toolCalls: [{ id: "call-1", tool: "search", input: { q: "test" } }],
      }),
    );
    expect(result).not.toHaveProperty("content");
  });

  it("extracts reasoning from response output", () => {
    // Exercise
    const response: Responses.Response = {
      id: "resp-1",
      output: [
        {
          type: "reasoning",
          id: "rs_123",
          content: [{ type: "reasoning_text", text: "The model reasoned..." }],
          signature: "sig-123",
          summary: [{ type: "summary_text", text: "Summary of reasoning" }],
        },
        {
          type: "message",
          role: "assistant",
          content: [{ type: "output_text", text: "Hello!" }],
        },
      ],
      usage: { input_tokens: 80, output_tokens: 20, total_tokens: 100 },
    };
    const result = fromResponsesResponse(response, inferenceOptions, 1200);

    // Verify
    expect(result.reasoning).toEqual({
      content: "The model reasoned...",
      contentSignature: "sig-123",
      summary: "Summary of reasoning",
    });
  });

  it("extracts reasoning with multiple content parts", () => {
    // Exercise
    const response: Responses.Response = {
      id: "resp-1",
      output: [
        {
          type: "reasoning",
          id: "rs_456",
          content: [
            { type: "reasoning_text", text: "First thought." },
            { type: "reasoning_text", text: "Second thought." },
          ],
        },
        {
          type: "message",
          role: "assistant",
          content: [{ type: "output_text", text: "Hello!" }],
        },
      ],
      usage: { input_tokens: 80, output_tokens: 20, total_tokens: 100 },
    };
    const result = fromResponsesResponse(response, inferenceOptions, 1200);

    // Verify
    expect(result.reasoning).toEqual({
      content: "First thought.\nSecond thought.",
    });
  });

  it("returns empty reasoning when no reasoning output item", () => {
    // Exercise
    const response: Responses.Response = {
      id: "resp-1",
      output: [
        {
          type: "message",
          role: "assistant",
          content: [{ type: "output_text", text: "Hello!" }],
        },
      ],
      usage: { input_tokens: 80, output_tokens: 20, total_tokens: 100 },
    };
    const result = fromResponsesResponse(response, inferenceOptions, 1200);

    // Verify
    expect(result.reasoning).toEqual({});
  });

  it("joins text from multiple message output items", () => {
    // Exercise
    const response: Responses.Response = {
      id: "resp-1",
      output: [
        {
          type: "message",
          role: "assistant",
          content: [{ type: "output_text", text: "Part 1" }],
        },
        {
          type: "message",
          role: "assistant",
          content: [{ type: "output_text", text: "Part 2" }],
        },
      ],
      usage: { input_tokens: 60, output_tokens: 40, total_tokens: 100 },
    };
    const result = fromResponsesResponse(response, inferenceOptions, 900);

    // Verify
    expect(result).toEqual(
      expect.objectContaining({
        content: [
          { type: MessageContentPartType.Text, text: "Part 1\nPart 2" },
        ],
      }),
    );
  });
});

describe("extractTextFromResponse", () => {
  it("extracts text from message output items", () => {
    // Exercise
    const response: Responses.Response = {
      id: "resp-1",
      output: [
        {
          type: "message",
          role: "assistant",
          content: [
            { type: "output_text", text: "Hello" },
            { type: "output_text", text: "World" },
          ],
        },
      ],
      usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
    };
    const result = extractTextFromResponse(response);

    // Verify
    expect(result).toBe("Hello\nWorld");
  });

  it("returns empty string when no message items", () => {
    // Exercise
    const response: Responses.Response = {
      id: "resp-1",
      output: [
        {
          type: "function_call",
          id: "fc-1",
          call_id: "call-1",
          name: "search",
          arguments: "{}",
        },
      ],
      usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
    };
    const result = extractTextFromResponse(response);

    // Verify
    expect(result).toBe("");
  });
});

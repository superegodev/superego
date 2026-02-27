import {
  type InferenceOptions,
  type Message,
  MessageContentPartType,
  MessageRole,
} from "@superego/backend";
import { InferenceService } from "@superego/executing-backend";
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
  },
  transcription: null,
  fileInspection: null,
};

describe("toResponsesRequest", () => {
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
    const result = toResponsesRequest("gpt-oss-120b", messages, tools);

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

  it("sets tools to undefined when empty", () => {
    // Exercise
    const messages: Message[] = [
      {
        role: MessageRole.User,
        content: [{ type: MessageContentPartType.Text, text: "Hello" }],
        createdAt: new Date(),
      },
    ];
    const result = toResponsesRequest("gpt-oss-120b", messages, []);

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
    const result = toResponsesRequest("gpt-oss-120b", messages, []);

    // Verify
    expect(result.input).toEqual([
      { type: "message", role: "system", content: "You are helpful." },
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
    const result = toResponsesRequest("gpt-oss-120b", messages, []);

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
    const result = toResponsesRequest("gpt-oss-120b", messages, []);

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
    const result = toResponsesRequest("gpt-oss-120b", messages, []);

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
    const result = toResponsesRequest("gpt-oss-120b", messages, []);

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
    const result = toResponsesRequest("gpt-oss-120b", messages, []);

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
    const result = toResponsesRequest("gpt-oss-120b", messages, []);

    // Verify
    const inputItem = result.input[0] as Responses.MessageItem;
    expect(inputItem.content).toEqual([]);
  });

  it("converts tool message to function call outputs", () => {
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
    const result = toResponsesRequest("gpt-oss-120b", messages, []);

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
        role: MessageRole.Assistant,
        toolCalls: [
          { id: "call-1", tool: "get_weather", input: { city: "NYC" } },
        ],
        inferenceOptions,
        createdAt: new Date(),
      },
    ];
    const result = toResponsesRequest("gpt-oss-120b", messages, []);

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
        role: MessageRole.Assistant,
        content: [
          { type: MessageContentPartType.Text, text: "Line 1" },
          { type: MessageContentPartType.Text, text: "Line 2" },
        ],
        inferenceOptions,
        createdAt: new Date(),
      },
    ];
    const result = toResponsesRequest("gpt-oss-120b", messages, []);

    // Verify
    expect(result.input).toEqual([
      { type: "message", role: "assistant", content: "Line 1\nLine 2" },
    ]);
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
    };
    const result = fromResponsesResponse(response, inferenceOptions);

    // Verify
    expect(result).toEqual(
      expect.objectContaining({
        role: MessageRole.Assistant,
        toolCalls: [
          { id: "call-1", tool: "get_weather", input: { city: "NYC" } },
        ],
        inferenceOptions,
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
    };
    const result = fromResponsesResponse(response, inferenceOptions);

    // Verify
    expect(result).toEqual(
      expect.objectContaining({
        role: MessageRole.Assistant,
        content: [{ type: MessageContentPartType.Text, text: "Hello!" }],
        inferenceOptions,
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
    };
    const result = fromResponsesResponse(response, inferenceOptions);

    // Verify
    expect(result).toEqual(
      expect.objectContaining({
        role: MessageRole.Assistant,
        toolCalls: [{ id: "call-1", tool: "search", input: { q: "test" } }],
      }),
    );
    expect(result).not.toHaveProperty("content");
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
    };
    const result = fromResponsesResponse(response, inferenceOptions);

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
    };
    const result = extractTextFromResponse(response);

    // Verify
    expect(result).toBe("");
  });
});

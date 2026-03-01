import type { Message } from "@superego/backend";
import { MessageContentPartType, MessageRole } from "@superego/backend";
import { describe, expect, it } from "vitest";
import aggregateGenerationStats from "./aggregateGenerationStats.js";

function makeContentAssistant(stats: {
  inputTokens: number;
  outputTokens: number;
  cost?: number;
}): Message.ContentAssistant {
  return {
    role: MessageRole.Assistant,
    content: [{ type: MessageContentPartType.Text, text: "hello" }],
    inferenceOptions: { completion: {} } as any,
    generationStats: {
      timeTaken: 100,
      inputTokens: stats.inputTokens,
      outputTokens: stats.outputTokens,
      totalTokens: stats.inputTokens + stats.outputTokens,
      cost: stats.cost,
    },
    createdAt: new Date(),
  };
}

function makeToolCallAssistant(
  stats: { inputTokens: number; outputTokens: number; cost?: number },
  toolCallCount = 1,
): Message.ToolCallAssistant {
  return {
    role: MessageRole.Assistant,
    toolCalls: Array.from({ length: toolCallCount }, (_, i) => ({
      id: `tc_${i}`,
      tool: "some_tool",
      input: {},
    })),
    inferenceOptions: { completion: {} } as any,
    generationStats: {
      timeTaken: 50,
      inputTokens: stats.inputTokens,
      outputTokens: stats.outputTokens,
      totalTokens: stats.inputTokens + stats.outputTokens,
      cost: stats.cost,
    },
    createdAt: new Date(),
  };
}

function makeUserMessage(): Message.User {
  return {
    role: MessageRole.User,
    content: [{ type: MessageContentPartType.Text, text: "hi" }],
    createdAt: new Date(),
  };
}

function makeToolMessage(): Message.Tool {
  return {
    role: MessageRole.Tool,
    toolResults: [],
    createdAt: new Date(),
  };
}

describe("aggregateGenerationStats", () => {
  it("returns stats from a single assistant message with no tool calls", () => {
    // Exercise
    const user = makeUserMessage();
    const assistant = makeContentAssistant({
      inputTokens: 100,
      outputTokens: 50,
      cost: 0.01,
    });
    const messages: Message[] = [user, assistant];
    const result = aggregateGenerationStats(messages, assistant);

    // Verify
    expect(result).toEqual({
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
      timeTaken: 100,
      cost: 0.01,
      toolCallCount: 0,
    });
  });

  it("aggregates stats from tool call assistants and the final content assistant", () => {
    // Exercise
    const user = makeUserMessage();
    const toolCallAssistant = makeToolCallAssistant({
      inputTokens: 200,
      outputTokens: 30,
      cost: 0.005,
    });
    const tool = makeToolMessage();
    const assistant = makeContentAssistant({
      inputTokens: 300,
      outputTokens: 80,
      cost: 0.02,
    });
    const messages: Message[] = [user, toolCallAssistant, tool, assistant];
    const result = aggregateGenerationStats(messages, assistant);

    // Verify
    expect(result).toEqual({
      inputTokens: 500,
      outputTokens: 110,
      totalTokens: 610,
      timeTaken: 150,
      cost: 0.025,
      toolCallCount: 1,
    });
  });

  it("aggregates stats from multiple tool call rounds", () => {
    // Exercise
    const user = makeUserMessage();
    const toolCall1 = makeToolCallAssistant(
      { inputTokens: 100, outputTokens: 20 },
      2,
    );
    const tool1 = makeToolMessage();
    const toolCall2 = makeToolCallAssistant(
      { inputTokens: 200, outputTokens: 30 },
      3,
    );
    const tool2 = makeToolMessage();
    const assistant = makeContentAssistant({
      inputTokens: 300,
      outputTokens: 50,
    });
    const messages: Message[] = [
      user,
      toolCall1,
      tool1,
      toolCall2,
      tool2,
      assistant,
    ];
    const result = aggregateGenerationStats(messages, assistant);

    // Verify
    expect(result).toEqual({
      inputTokens: 600,
      outputTokens: 100,
      totalTokens: 700,
      timeTaken: 200,
      cost: undefined,
      toolCallCount: 5,
    });
  });

  it("stops aggregation at the preceding user message", () => {
    // Exercise
    const user1 = makeUserMessage();
    const oldAssistant = makeContentAssistant({
      inputTokens: 1000,
      outputTokens: 500,
    });
    const user2 = makeUserMessage();
    const assistant = makeContentAssistant({
      inputTokens: 100,
      outputTokens: 50,
    });
    const messages: Message[] = [user1, oldAssistant, user2, assistant];
    const result = aggregateGenerationStats(messages, assistant);

    // Verify
    expect(result).toEqual({
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
      timeTaken: 100,
      cost: undefined,
      toolCallCount: 0,
    });
  });

  it("sums cost only when present on some messages", () => {
    // Exercise
    const user = makeUserMessage();
    const toolCall = makeToolCallAssistant({
      inputTokens: 100,
      outputTokens: 20,
      cost: 0.01,
    });
    const tool = makeToolMessage();
    const assistant = makeContentAssistant({
      inputTokens: 200,
      outputTokens: 40,
    });
    const messages: Message[] = [user, toolCall, tool, assistant];
    const result = aggregateGenerationStats(messages, assistant);

    // Verify
    expect(result.cost).toEqual(0.01);
  });

  it("counts tool calls across multiple tool call messages", () => {
    // Exercise
    const user = makeUserMessage();
    const toolCall1 = makeToolCallAssistant(
      { inputTokens: 50, outputTokens: 10 },
      1,
    );
    const tool1 = makeToolMessage();
    const toolCall2 = makeToolCallAssistant(
      { inputTokens: 50, outputTokens: 10 },
      4,
    );
    const tool2 = makeToolMessage();
    const assistant = makeContentAssistant({
      inputTokens: 100,
      outputTokens: 20,
    });
    const messages: Message[] = [
      user,
      toolCall1,
      tool1,
      toolCall2,
      tool2,
      assistant,
    ];
    const result = aggregateGenerationStats(messages, assistant);

    // Verify
    expect(result.toolCallCount).toEqual(5);
  });
});

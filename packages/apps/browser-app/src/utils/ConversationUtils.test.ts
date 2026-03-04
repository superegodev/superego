import { ConversationStatus, MessageRole } from "@superego/backend";
import { Id } from "@superego/shared-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ConversationUtils from "./ConversationUtils.js";

describe("isStuckProcessing", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("1970-01-01T00:10:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const testCases: {
    label: string;
    status: ConversationStatus;
    lastMessageCreatedAt: Date | null;
    expected: boolean;
  }[] = [
    {
      label: "Idle, old message",
      status: ConversationStatus.Idle,
      lastMessageCreatedAt: new Date("1970-01-01T00:00:00Z"),
      expected: false,
    },
    {
      label: "Error, old message",
      status: ConversationStatus.Error,
      lastMessageCreatedAt: new Date("1970-01-01T00:00:00Z"),
      expected: false,
    },
    {
      label: "Processing, recent message",
      status: ConversationStatus.Processing,
      lastMessageCreatedAt: new Date("1970-01-01T00:06:00Z"),
      expected: false,
    },
    {
      label: "Processing, message older than 5 minutes",
      status: ConversationStatus.Processing,
      lastMessageCreatedAt: new Date("1970-01-01T00:04:59Z"),
      expected: true,
    },
    {
      label: "Processing, no messages with createdAt",
      status: ConversationStatus.Processing,
      lastMessageCreatedAt: null,
      expected: false,
    },
  ];
  it.each(testCases)("case: $label -> $expected", ({
    status,
    lastMessageCreatedAt,
    expected,
  }) => {
    // Exercise
    const conversation = {
      id: Id.generate.conversation(),
      assistant: "default",
      title: null,
      hasOutdatedContext: false,
      canRetryLastResponse: false,
      messages:
        lastMessageCreatedAt !== null
          ? [
              {
                id: Id.generate.message(),
                role: MessageRole.User,
                content: [{ type: "text" as const, text: "Hello" }],
                createdAt: lastMessageCreatedAt,
              },
            ]
          : [
              {
                role: MessageRole.Developer,
                content: [{ type: "text" as const, text: "system" }],
              },
            ],
      status,
      error:
        status === ConversationStatus.Error
          ? { name: "TestError", details: {} }
          : null,
      createdAt: new Date("1970-01-01T00:00:00Z"),
    } as any;
    const result = ConversationUtils.isStuckProcessing(conversation);

    // Verify
    expect(result).toBe(expected);
  });
});

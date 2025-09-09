import {
  type Backend,
  type Conversation,
  type ConversationId,
  ConversationStatus,
  type Message,
  MessageRole,
} from "@superego/backend";
import { assert, vi } from "vitest";
import assertSuccessfulResult from "../../utils/assertSuccessfulResult.js";
import type BooleanOracle from "../../utils/BooleanOracle.js";

export default async function expectReply(
  backend: Backend,
  booleanOracle: BooleanOracle,
  conversationId: ConversationId,
  requirement: string,
): Promise<void> {
  const conversation = await vi.waitUntil(
    () => getIdleConversation(backend, conversationId),
    { timeout: 20_000, interval: 200 },
  );
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  assertIsContentAssistantMessage(lastMessage);

  const reply = lastMessage.content[0].text;

  const { answer, reason } = await booleanOracle.ask(
    `
      Consider this reply given by an LLM:

      <reply>
      ${reply}
      </reply>

      Does it satisfy the following requirement?

      <requirement>
      Reply must: ${requirement}
      </requirement>
    `
      .trim()
      .replaceAll(/^ {6}/g, ""),
  );

  assert.isTrue(
    answer,
    [
      "Reply does not match requirement.",
      `Reply: ${reply}`,
      `Reason: ${reason}`,
      "",
    ].join("\n"),
  );
}

async function getIdleConversation(
  backend: Backend,
  id: ConversationId,
): Promise<Conversation | null> {
  const getConversationResult = await backend.assistants.getConversation(id);
  assertSuccessfulResult("Error getting conversation", getConversationResult);
  const { data: conversation } = getConversationResult;
  return conversation.status === ConversationStatus.Idle ? conversation : null;
}

function assertIsContentAssistantMessage(
  message: Message | undefined,
): asserts message is Message.ContentAssistant {
  assert.isDefined(message);
  assert.equal(message.role, MessageRole.Assistant);
  assert.isTrue("content" in message && Array.isArray(message.content));
}

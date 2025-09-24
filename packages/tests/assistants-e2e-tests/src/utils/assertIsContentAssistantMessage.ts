import { type Message, MessageRole } from "@superego/backend";
import { assert } from "vitest";

export default function assertIsContentAssistantMessage(
  message: Message | undefined,
): asserts message is Message.ContentAssistant {
  assert.isDefined(message);
  assert.equal(message.role, MessageRole.Assistant);
  assert.isTrue("content" in message && Array.isArray(message.content));
}

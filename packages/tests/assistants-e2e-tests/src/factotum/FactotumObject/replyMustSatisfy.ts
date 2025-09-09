import {
  type Conversation,
  type Message,
  MessageRole,
} from "@superego/backend";
import { assert } from "vitest";
import type Evaluator from "../../utils/Evaluator.js";

export default async function replyMustSatisfy(
  evaluator: Evaluator,
  conversation: Conversation,
  requirements: string,
  scoreThreshold: number,
): Promise<void> {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  assertIsContentAssistantMessage(lastMessage);

  const reply = lastMessage.content[0].text;

  const { score, reason } = await evaluator.score(
    `
      Consider this reply given by an LLM:

      <reply>
      ${reply}
      </reply>

      How well does it satisfy these requirements? Give a score from 0 to 1.

      <requirements>
      ${requirements}
      </requirements>
    `
      .trim()
      .replaceAll(/^ {6}/g, ""),
  );

  assert.isTrue(
    score >= scoreThreshold,
    [
      "Reply does not satisfy requirement.",
      `Reply: ${reply}`,
      `Score: ${score}`,
      `Reason: ${reason}`,
      "",
    ].join("\n"),
  );
}

function assertIsContentAssistantMessage(
  message: Message | undefined,
): asserts message is Message.ContentAssistant {
  assert.isDefined(message);
  assert.equal(message.role, MessageRole.Assistant);
  assert.isTrue("content" in message && Array.isArray(message.content));
}

import {
  AssistantName,
  type Backend,
  type Conversation,
  ConversationFormat,
  type ConversationId,
  MessageContentPartType,
} from "@superego/backend";
import assertSuccessfulResult from "../../utils/assertSuccessfulResult.js";

export default async function say(
  backend: Backend,
  conversationId: ConversationId | null,
  message: string,
): Promise<Conversation> {
  if (conversationId === null) {
    const startConversationResult = await backend.assistants.startConversation(
      AssistantName.Factotum,
      ConversationFormat.Text,
      [
        {
          type: MessageContentPartType.Text,
          text: message,
        },
      ],
    );
    assertSuccessfulResult(
      "Failed to start conversation",
      startConversationResult,
    );
    return startConversationResult.data;
  }
  const continueConversationResult =
    await backend.assistants.continueConversation(conversationId, [
      {
        type: MessageContentPartType.Text,
        text: message,
      },
    ]);
  assertSuccessfulResult(
    "Failed to continue conversation",
    continueConversationResult,
  );

  return continueConversationResult.data;
}

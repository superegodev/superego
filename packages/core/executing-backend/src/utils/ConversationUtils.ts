import {
  type Collection,
  type Message,
  MessageRole,
  ToolName,
} from "@superego/backend";
import sha256 from "./sha256.js";

export default {
  /**
   * Checks if the last response (i.e., all messages since the last user
   * message) had any side effects.
   */
  lastResponseHadSideEffects(messages: Message[]): boolean {
    const toolMessages: Message.Tool[] = [];
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i]!;
      if (message.role === MessageRole.User) {
        break;
      }
      if (message.role === MessageRole.Tool) {
        toolMessages.push(message);
      }
    }

    return toolMessages.some((message) =>
      message.toolResults.some(
        (toolResult) =>
          toolResult.output.success &&
          (toolResult.tool === ToolName.CreateDocument ||
            toolResult.tool === ToolName.CreateNewDocumentVersion),
      ),
    );
  },

  /**
   * Removes all messages since the last user message, i.e., the last response.
   */
  sliceOffLastResponse(messages: Message[]): Message[] {
    const lastUserMessageIndex = messages.findLastIndex(
      (message) => message.role === MessageRole.User,
    );
    return messages.slice(0, lastUserMessageIndex + 1);
  },

  getContextFingerprint(collections: Collection[]): Promise<string> {
    return sha256(
      collections.map((collection) => collection.latestVersion.id).join(""),
    );
  },
};

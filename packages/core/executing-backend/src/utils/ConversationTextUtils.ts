import {
  type Message,
  MessageContentPartType,
  MessageRole,
} from "@superego/backend";

export default {
  extractTextChunks(
    title: string | null,
    messages: Message[],
  ): { title: string[]; messages: string[] } {
    return {
      title: title ? [title] : [],
      messages: messages.flatMap((message) => {
        switch (message.role) {
          case MessageRole.Developer:
          case MessageRole.UserContext:
          case MessageRole.Tool:
            return [];
          case MessageRole.User:
            return message.content
              .filter((part) => part.type === MessageContentPartType.Text)
              .map((part) => part.text);
          case MessageRole.Assistant:
            return "content" in message
              ? message.content.map((part) => part.text)
              : [];
        }
      }),
    };
  },
};

import {
  type Message,
  type MessageContentPart,
  MessageContentPartType,
  MessageRole,
  type ToolCall,
  type ToolResult,
} from "@superego/backend";
import type { FileRef } from "@superego/schema";
import pMap from "p-map";
import type InferenceService from "../requirements/InferenceService.js";
import isEmpty from "../utils/isEmpty.js";

export default abstract class Assistant {
  protected abstract inferenceService: InferenceService;
  protected abstract getTools(): InferenceService.Tool[];
  protected abstract processToolCall(toolCall: ToolCall): Promise<ToolResult>;
  protected abstract getDeveloperPrompt(): string;
  protected abstract getUserContextPrompt(): string;

  async generateAndProcessNextMessages(
    messages: Message[],
  ): Promise<Message[]> {
    try {
      const assistantMessage = await this.inferenceService.generateNextMessage(
        [
          {
            role: MessageRole.Developer,
            content: [
              {
                type: MessageContentPartType.Text,
                text: this.getDeveloperPrompt(),
              },
            ],
          },
          {
            role: MessageRole.UserContext,
            content: [
              {
                type: MessageContentPartType.Text,
                text: this.getUserContextPrompt(),
              },
            ],
          },
          ...messages.map((message) =>
            message.role === MessageRole.User
              ? Assistant.convertFileParts(message)
              : message,
          ),
        ],
        this.getTools(),
      );

      // Case: assistantMessage is Message.ContentAssistant
      if ("content" in assistantMessage) {
        return [...messages, assistantMessage];
      }

      // Case: assistantMessage is Message.ToolCallAssistant.
      const toolResults: ToolResult[] = await pMap(
        assistantMessage.toolCalls,
        (toolCall) => this.processToolCall(toolCall),
        { concurrency: 1 },
      );
      const toolMessage: Message.Tool = {
        role: MessageRole.Tool,
        toolResults: toolResults,
        createdAt: new Date(),
      };
      return this.generateAndProcessNextMessages([
        ...messages,
        assistantMessage,
        toolMessage,
      ]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private static convertFileParts(message: Message.User): Message.User {
    const fileRefParts: (MessageContentPart.File & { file: FileRef })[] = [];
    const otherParts: MessageContentPart[] = [];
    for (const part of message.content) {
      if (part.type === MessageContentPartType.File && "id" in part.file) {
        fileRefParts.push(part as MessageContentPart.File & { file: FileRef });
      } else {
        otherParts.push(part);
      }
    }

    if (isEmpty(fileRefParts)) {
      return message;
    }

    const referencedFilesTextPart: MessageContentPart.Text = {
      type: MessageContentPartType.Text,
      text: `
<referenced-files>
${JSON.stringify(fileRefParts.map((part) => part.file))}
</referenced-files>
      `.trim(),
    };

    return { ...message, content: [referencedFilesTextPart, ...otherParts] };
  }
}

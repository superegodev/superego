import {
  type Message,
  MessageContentPartType,
  MessageRole,
  type ToolCall,
  type ToolResult,
} from "@superego/backend";
import type InferenceService from "../requirements/InferenceService.js";

export default abstract class Assistant {
  protected abstract inferenceService: InferenceService;
  protected abstract getTools(): InferenceService.Tool[];
  protected abstract processToolCall(toolCall: ToolCall): Promise<ToolResult>;
  protected abstract getDeveloperPrompt(): string;
  protected abstract getUserContextPrompt(): string;

  async generateAndProcessNextMessages(
    messages: Message[],
  ): Promise<Message[]> {
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
        ...messages,
      ],
      this.getTools(),
    );

    // Case: assistantMessage is Message.ContentAssistant
    if ("content" in assistantMessage) {
      return [...messages, assistantMessage];
    }

    // Case: assistantMessage is Message.ToolCallAssistant.
    const toolResults: ToolResult[] = await Promise.all(
      assistantMessage.toolCalls.map((toolCall) =>
        this.processToolCall(toolCall),
      ),
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
  }
}

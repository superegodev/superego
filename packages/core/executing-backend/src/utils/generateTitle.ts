import {
  type Message,
  MessageContentPartType,
  MessageRole,
} from "@superego/backend";
import type InferenceService from "../requirements/InferenceService.js";

export default async function generateTitle(
  inferenceService: InferenceService,
  message: Message.User,
): Promise<string | null> {
  try {
    const assistantMessage = await inferenceService.generateNextMessage(
      [
        {
          role: MessageRole.Developer,
          content: [
            {
              type: MessageContentPartType.Text,
              text: "Summarize in 5 words or less the user message.",
            },
          ],
        },
        message,
      ],
      [],
    );
    return "content" in assistantMessage
      ? assistantMessage.content[0].text
      : null;
  } catch (error) {
    console.error("Error generating title.");
    console.error(error);
    return null;
  }
}

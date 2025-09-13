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
              text: `
You will receive the FIRST user message of a brand-new assistant conversation.

TASK: Generate a concise, descriptive conversation title based solely on that
message.

OUTPUT REQUIREMENTS
- Use between 3 and 5 words.
- Title Case major words.
- Use the message’s language.
- Reply with the title ONLY (no extra text, quotes, emojis, or explanations).
- Do not add punctuation, except keep punctuation that is part of names/tech
  (e.g., Next.js, C++).
- Prefer salient keywords and entities from the message; avoid private details
  unless explicitly provided and central.
- If the message is vague (e.g., “Hi”), infer a helpful, generic five-word title
  (e.g., “Greeting And Conversation Kickoff Start”).

WORD COUNT RULES
- Words are tokens separated by single spaces.
- Hyphenated terms count as one word.
- Numbers and acronyms count as one word.
              `,
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

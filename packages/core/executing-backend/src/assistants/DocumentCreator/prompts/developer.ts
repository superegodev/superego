import { ConversationFormat } from "@superego/backend";
import developerText from "./developerText.md?raw";
import developerVoice from "./developerVoice.md?raw";

export default function developer(
  conversationFormat: ConversationFormat,
): string {
  switch (conversationFormat) {
    case ConversationFormat.Text:
      return developerText;
    case ConversationFormat.Voice:
      return developerVoice;
  }
}

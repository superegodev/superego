import type { ResultError } from "@superego/global-types";
import type ConversationId from "../ids/ConversationId.js";

type CannotTranscribeAudioMessage = ResultError<
  "CannotTranscribeAudioMessage",
  {
    conversationId: ConversationId;
  }
>;
export default CannotTranscribeAudioMessage;

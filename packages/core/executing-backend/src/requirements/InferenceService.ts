import type { Message } from "@superego/backend";

export default interface InferenceService {
  generateNextMessage(
    previousMessages: Message[],
    // TODO: tools
  ): Promise<Message.Assistant>;
}

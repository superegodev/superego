import type { CompletionModel, ConversationType } from "@superego/backend";
import type { Assistant, CollectionEntity } from "@superego/executing-backend";

export default class GroqAssistant implements Assistant {
  constructor(
    _model: CompletionModel,
    _apiKey: string,
    _baseUrl: string | null,
  ) {
    //
  }

  generateNextMessage(
    _conversationType: ConversationType,
    _previousMessages: Assistant.Message[],
    _collections: CollectionEntity[],
  ): Promise<Assistant.GetNextMessageResult> {
    throw new Error("Method not implemented.");
  }
}

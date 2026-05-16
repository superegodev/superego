import type {
  Backend,
  Conversation,
  ConversationId,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class AssistantsGetLiveConversation extends BackendUsecase<
  Backend["assistants"]["getLiveConversation"]
> {
  argumentsSchema = v.tuple([structuralSchemas.backend.ids.conversationId()]);
  resultSchema = structuralSchemas.global.result(
    v.nullable(structuralSchemas.backend.types.conversation()),
    [structuralSchemas.backend.errors.unexpectedError()],
  );

  async exec(
    id: ConversationId,
  ): ResultPromise<Conversation | null, UnexpectedError> {
    const conversation = this.liveConversationStore.get(id);
    return makeSuccessfulResult(conversation);
  }
}

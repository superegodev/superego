import type {
  Backend,
  Conversation,
  ConversationId,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import BackendUsecase from "../../utils/BackendUsecase.js";
import { conversation as conversationSchema } from "../../validation/domain/conversation.js";
import { unexpectedError } from "../../validation/errors.js";
import { conversationId } from "../../validation/helpers/idSchemas.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class AssistantsGetLiveConversation extends BackendUsecase<
  Backend["assistants"]["getLiveConversation"]
> {
  argumentsSchema = v.tuple([conversationId()]);
  resultSchema = makeResultSchema(v.nullable(conversationSchema()), [
    unexpectedError(),
  ]);

  async exec(
    id: ConversationId,
  ): ResultPromise<Conversation | null, UnexpectedError> {
    const conversation = this.liveConversationStore.get(id);
    return makeSuccessfulResult(conversation);
  }
}

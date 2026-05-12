import type {
  Backend,
  Conversation,
  ConversationId,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import Usecase from "../../utils/Usecase.js";
import { conversation as conversationSchema } from "../../validation/domain/conversation.js";
import { unexpectedError } from "../../validation/errors.js";
import { conversationId } from "../../validation/helpers/idSchemas.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class AssistantsGetLiveConversation extends Usecase<
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

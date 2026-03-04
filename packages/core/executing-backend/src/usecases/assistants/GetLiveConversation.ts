import type {
  Backend,
  Conversation,
  ConversationId,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import Usecase from "../../utils/Usecase.js";

export default class AssistantsGetLiveConversation extends Usecase<
  Backend["assistants"]["getLiveConversation"]
> {
  async exec(
    id: ConversationId,
  ): ResultPromise<Conversation | null, UnexpectedError> {
    const conversation = this.liveConversationStore.get(id);
    return makeSuccessfulResult(conversation);
  }
}

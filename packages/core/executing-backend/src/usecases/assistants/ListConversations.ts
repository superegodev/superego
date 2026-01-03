import type {
  Backend,
  LiteConversation,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import UnexpectedAssistantError from "../../errors/UnexpectedAssistantError.js";
import makeConversation from "../../makers/makeConversation.js";
import ConversationUtils from "../../utils/ConversationUtils.js";
import Usecase from "../../utils/Usecase.js";
import CollectionsList from "../collections/List.js";

export default class AssistantsListConversations extends Usecase<
  Backend["assistants"]["listConversations"]
> {
  async exec(): ResultPromise<LiteConversation[], UnexpectedError> {
    const conversations = await this.repos.conversation.findAll();

    const { data: collections } = await this.sub(CollectionsList).exec();
    if (!collections) {
      throw new UnexpectedAssistantError("Getting collections failed.");
    }
    const contextFingerprint =
      await ConversationUtils.getContextFingerprint(collections);

    return makeSuccessfulResult(
      conversations
        .map((conversation) =>
          makeConversation(conversation, contextFingerprint),
        )
        .map(({ messages, ...conversation }) => conversation),
    );
  }
}

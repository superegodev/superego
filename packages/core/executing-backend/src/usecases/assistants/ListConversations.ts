import type { Backend, Conversation, UnexpectedError } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import UnexpectedAssistantError from "../../errors/UnexpectedAssistantError.js";
import makeConversation from "../../makers/makeConversation.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import getConversationContextFingerprint from "../../utils/getConversationContextFingerprint.js";
import Usecase from "../../utils/Usecase.js";
import CollectionsList from "../collections/List.js";

export default class AssistantsListConversations extends Usecase<
  Backend["assistants"]["listConversations"]
> {
  async exec(): ResultPromise<
    Omit<Conversation, "messages">[],
    UnexpectedError
  > {
    const conversations = await this.repos.conversation.findAll();

    const { data: collections } = await this.sub(CollectionsList).exec();
    if (!collections) {
      throw new UnexpectedAssistantError("Getting collections failed.");
    }
    const contextFingerprint =
      await getConversationContextFingerprint(collections);

    return makeSuccessfulResult(
      conversations
        .map((conversation) =>
          makeConversation(conversation, contextFingerprint),
        )
        .map(({ messages, ...conversation }) => conversation),
    );
  }
}

import type {
  Backend,
  LiteConversation,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import UnexpectedAssistantError from "../../errors/UnexpectedAssistantError.js";
import makeConversation from "../../makers/makeConversation.js";
import ConversationUtils from "../../utils/ConversationUtils.js";
import Usecase from "../../utils/Usecase.js";
import { liteConversation } from "../../validation/domain/conversation.js";
import { unexpectedError } from "../../validation/errors.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";
import CollectionsList from "../collections/List.js";

export default class AssistantsListConversations extends Usecase<
  Backend["assistants"]["listConversations"]
> {
  argumentsSchema = v.tuple([]);
  resultSchema = makeResultSchema(v.array(liteConversation()), [
    unexpectedError(),
  ]);

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

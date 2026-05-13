import type {
  Backend,
  LiteConversation,
  TextSearchResult,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import makeConversation from "../../makers/makeConversation.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import ConversationUtils from "../../utils/ConversationUtils.js";
import { liteConversation } from "../../validation/domain/conversation.js";
import { textSearchResult } from "../../validation/domain/textSearchResult.js";
import { unexpectedError } from "../../validation/errors.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";
import CollectionsList from "../collections/List.js";

export default class AssistantsSearchConversations extends BackendUsecase<
  Backend["assistants"]["searchConversations"]
> {
  argumentsSchema = v.tuple([
    v.string(),
    v.strictObject({ limit: v.number() }),
  ]);
  resultSchema = makeResultSchema(
    v.array(textSearchResult(liteConversation())),
    [unexpectedError()],
  );

  async exec(
    query: string,
    options: { limit: number },
  ): ResultPromise<TextSearchResult<LiteConversation>[], UnexpectedError> {
    const searchResults = await this.repos.conversationTextSearchIndex.search(
      query,
      options,
    );

    if (searchResults.length === 0) {
      return makeSuccessfulResult([]);
    }

    const collectionsListResult = await this.sub(CollectionsList).exec();
    if (!collectionsListResult.success) {
      return collectionsListResult;
    }
    const { data: collections } = collectionsListResult;

    const contextFingerprint =
      await ConversationUtils.getContextFingerprint(collections);

    const results: TextSearchResult<LiteConversation>[] = [];
    for (const { conversationId, matchedText } of searchResults) {
      const conversation = await this.repos.conversation.find(conversationId);
      if (!conversation) {
        continue;
      }
      const { messages, ...liteConversation } = makeConversation(
        conversation,
        contextFingerprint,
      );
      results.push({ match: liteConversation, matchedText });
    }

    return makeSuccessfulResult(results);
  }
}

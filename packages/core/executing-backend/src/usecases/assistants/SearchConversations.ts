import type {
  LiteConversation,
  TextSearchResult,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import makeConversation from "../../makers/makeConversation.js";
import ConversationUtils from "../../utils/ConversationUtils.js";
import Usecase from "../../utils/Usecase.js";
import validateArgs from "../../utils/validateArgs.js";
import CollectionsList from "../collections/List.js";

export default class AssistantsSearchConversations extends Usecase {
  @validateArgs([v.string(), v.strictObject({ limit: v.number() })])
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

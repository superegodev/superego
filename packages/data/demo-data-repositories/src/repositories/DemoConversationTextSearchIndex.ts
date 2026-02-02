import type { ConversationId } from "@superego/backend";
import type { ConversationTextSearchIndex } from "@superego/executing-backend";
import { Document as FlexsearchDocument } from "flexsearch";
import type { ConversationTextSearchText } from "../Data.js";
import Disposable from "../utils/Disposable.js";

type FlexsearchDocumentData = {
  id: ConversationId;
  text: string;
};

export interface SearchTextIndexState {
  index: FlexsearchDocument<FlexsearchDocumentData>;
  isLoaded: boolean;
}

export default class DemoConversationTextSearchIndex
  extends Disposable
  implements ConversationTextSearchIndex
{
  constructor(
    private conversationTextSearchTexts: Record<
      ConversationId,
      ConversationTextSearchText
    >,
    private searchTextIndexState: SearchTextIndexState,
    private onTransactionSucceeded: (callback: () => void) => void,
    private onWrite: () => void,
  ) {
    super();
  }

  async upsert(
    conversationId: ConversationId,
    textChunks: { title: string[]; messages: string[] },
  ): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    const text = [...textChunks.title, ...textChunks.messages].join(" | ");
    this.conversationTextSearchTexts[conversationId] = { conversationId, text };
    this.onTransactionSucceeded(() => {
      this.searchTextIndexState.index.remove(conversationId);
      this.searchTextIndexState.index.add({ id: conversationId, text });
    });
  }

  async remove(conversationId: ConversationId): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    delete this.conversationTextSearchTexts[conversationId];
    this.onTransactionSucceeded(() => {
      this.searchTextIndexState.index.remove(conversationId);
    });
  }

  async search(
    query: string,
    options: { limit: number },
  ): Promise<
    {
      conversationId: ConversationId;
      matchedText: string;
    }[]
  > {
    this.ensureNotDisposed();
    this.loadIndex();

    const results = this.searchTextIndexState.index.search(query, {
      limit: options.limit,
      merge: true,
      enrich: true,
      highlight: {
        template: "«$1»",
        boundary: 128,
      },
    });

    return results.map(({ id, highlight }) => ({
      conversationId: id as ConversationId,
      matchedText: highlight!.text,
    }));
  }

  private loadIndex(): void {
    if (this.searchTextIndexState.isLoaded) {
      return;
    }

    for (const { conversationId, text } of Object.values(
      this.conversationTextSearchTexts,
    )) {
      this.searchTextIndexState.index.add({ id: conversationId, text });
    }

    this.searchTextIndexState.isLoaded = true;
  }

  static getSearchTextIndexState(): SearchTextIndexState {
    return {
      index: new FlexsearchDocument<FlexsearchDocumentData>({
        document: {
          id: "id",
          index: ["text"],
          store: ["text"],
        },
        tokenize: "forward",
        context: true,
      }),
      isLoaded: false,
    };
  }
}

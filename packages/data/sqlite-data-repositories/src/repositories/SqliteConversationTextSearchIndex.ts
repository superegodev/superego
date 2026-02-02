import type { DatabaseSync } from "node:sqlite";
import type { ConversationId } from "@superego/backend";
import type { ConversationTextSearchIndex } from "@superego/executing-backend";
import { Document as FlexsearchDocument } from "flexsearch";
import type SqliteConversationTextSearchText from "../types/SqliteConversationTextSearchText.js";

const table = "conversation_text_search_texts";

type FlexsearchDocumentData = {
  id: ConversationId;
  text: string;
};

export interface SearchTextIndexState {
  index: FlexsearchDocument<FlexsearchDocumentData>;
  isLoaded: boolean;
}

export default class SqliteConversationTextSearchIndex
  implements ConversationTextSearchIndex
{
  constructor(
    private db: DatabaseSync,
    private searchTextIndexState: SearchTextIndexState,
    private onTransactionSucceeded: (callback: () => void) => void,
  ) {}

  async upsert(
    conversationId: ConversationId,
    textChunks: { title: string[]; messages: string[] },
  ): Promise<void> {
    const text = [...textChunks.title, ...textChunks.messages].join(" | ");
    this.db
      .prepare(`
        INSERT OR REPLACE INTO "${table}"
          ("conversation_id", "text")
        VALUES
          (?, ?)
      `)
      .run(conversationId, text);

    this.onTransactionSucceeded(() => {
      this.searchTextIndexState.index.remove(conversationId);
      this.searchTextIndexState.index.add({ id: conversationId, text });
    });
  }

  async remove(conversationId: ConversationId): Promise<void> {
    this.db
      .prepare(`DELETE FROM "${table}" WHERE "conversation_id" = ?`)
      .run(conversationId);

    this.onTransactionSucceeded(() =>
      this.searchTextIndexState.index.remove(conversationId),
    );
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

    const conversationTextSearchTexts = this.db
      .prepare(`SELECT * FROM "${table}"`)
      .all() as SqliteConversationTextSearchText[];

    for (const { conversation_id, text } of conversationTextSearchTexts) {
      this.searchTextIndexState.index.add({ id: conversation_id, text: text });
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

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

export default class SqliteConversationTextSearchIndex
  implements ConversationTextSearchIndex
{
  private index: FlexsearchDocument<FlexsearchDocumentData>;
  private indexLoaded = false;

  constructor(private db: DatabaseSync) {
    this.index = new FlexsearchDocument<FlexsearchDocumentData>({
      document: {
        id: "id",
        index: ["text"],
        store: ["text"],
      },
      tokenize: "forward",
      context: true,
    });
  }

  async upsert(
    conversationId: ConversationId,
    textChunks: { title: string[]; messages: string[] },
  ): Promise<void> {
    this.loadIndexIfNeeded();

    const text = [...textChunks.title, ...textChunks.messages].join(" | ");

    this.db
      .prepare(`
        INSERT OR REPLACE INTO "${table}"
          ("conversation_id", "text")
        VALUES
          (?, ?)
      `)
      .run(conversationId, text);

    this.index.remove(conversationId);
    this.index.add({
      id: conversationId,
      text,
    });
  }

  async remove(conversationId: ConversationId): Promise<void> {
    this.loadIndexIfNeeded();

    this.db
      .prepare(`DELETE FROM "${table}" WHERE "conversation_id" = ?`)
      .run(conversationId);

    this.index.remove(conversationId);
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
    this.loadIndexIfNeeded();

    const results = this.index.search(query, {
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

  private loadIndexIfNeeded(): void {
    if (this.indexLoaded) {
      return;
    }

    const conversationTextSearchTexts = this.db
      .prepare(`SELECT * FROM "${table}"`)
      .all() as SqliteConversationTextSearchText[];

    for (const { conversation_id, text } of conversationTextSearchTexts) {
      this.index.add({
        id: conversation_id,
        text: text,
      });
    }

    this.indexLoaded = true;
  }
}

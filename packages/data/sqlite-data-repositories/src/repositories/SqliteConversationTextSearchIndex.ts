import type { DatabaseSync } from "node:sqlite";
import type { ConversationId } from "@superego/backend";
import type { ConversationTextSearchIndex } from "@superego/executing-backend";
import { Document as FlexsearchDocument } from "flexsearch";
import type SqliteFlexsearchIndex from "../types/SqliteFlexsearchIndex.js";

const table = "flexsearch_indexes";

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
    this.importIndex();
    this.index.remove(conversationId);
    this.index.add({
      id: conversationId,
      text: [...textChunks.title, ...textChunks.messages].join(" | "),
    });
    this.exportIndex();
  }

  async remove(conversationId: ConversationId): Promise<void> {
    this.importIndex();
    this.index.remove(conversationId);
    this.exportIndex();
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
    this.importIndex();

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

  private importIndex(): void {
    if (this.indexLoaded) {
      return;
    }

    const flexsearchIndexes = this.db
      .prepare(`SELECT * FROM "${table}" WHERE "target" = 'conversation'`)
      .all() as SqliteFlexsearchIndex[];

    for (const { key, data } of flexsearchIndexes) {
      this.index.import(key, data);
    }

    this.indexLoaded = true;
  }

  private exportIndex(): void {
    // Delete all existing conversation index data first, then re-export. This
    // is necessary because Flexsearch's export after removing documents doesn't
    // include empty index keys, leaving stale data in SQLite.
    this.db
      .prepare(`DELETE FROM "${table}" WHERE "target" = 'conversation'`)
      .run();
    const insert = this.db.prepare(`
      INSERT INTO "${table}"
        ("key", "target", "data")
      VALUES
        (?, ?, ?)
    `);
    this.index.export((key, data) => insert.run(key, "conversation", data));
  }
}

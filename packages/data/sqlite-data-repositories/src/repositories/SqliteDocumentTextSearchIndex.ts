import type { DatabaseSync } from "node:sqlite";
import type { CollectionId, DocumentId } from "@superego/backend";
import type { DocumentTextSearchIndex } from "@superego/executing-backend";
import type { TextChunks } from "@superego/schema";
import { Document as FlexsearchDocument } from "flexsearch";
import type SqliteFlexsearchIndex from "../types/SqliteFlexsearchIndex.js";

const table = "flexsearch_indexes";

type FlexsearchDocumentData = {
  id: DocumentId;
  collectionId: CollectionId;
  text: string;
};

export default class SqliteDocumentTextSearchIndex
  implements DocumentTextSearchIndex
{
  private index: FlexsearchDocument<FlexsearchDocumentData>;
  private indexLoaded = false;

  constructor(private db: DatabaseSync) {
    this.index = new FlexsearchDocument<FlexsearchDocumentData>({
      document: {
        id: "id",
        index: ["text"],
        tag: ["collectionId"],
        store: ["collectionId", "text"],
      },
      tokenize: "forward",
      context: true,
    });
  }

  async upsert(
    collectionId: CollectionId,
    documentId: DocumentId,
    textChunks: TextChunks,
  ): Promise<void> {
    this.importIndex();
    this.index.remove(documentId);
    this.index.add({
      id: documentId,
      collectionId,
      // Combine all text chunks into a single searchable text.
      text: Object.values(textChunks).flat().join(" | "),
    });
    this.exportIndex();
  }

  async remove(
    _collectionId: CollectionId,
    documentId: DocumentId,
  ): Promise<void> {
    this.importIndex();
    this.index.remove(documentId);
    this.exportIndex();
  }

  async search(
    collectionId: CollectionId | null,
    query: string,
    options: { limit: number },
  ): Promise<
    {
      collectionId: CollectionId;
      documentId: DocumentId;
      matchedText: string;
    }[]
  > {
    this.importIndex();

    const results = this.index.search(query, {
      tag: collectionId ? { collectionId } : undefined,
      limit: options.limit,
      merge: true,
      enrich: true,
      highlight: {
        template: "«$1»",
        boundary: 128,
      },
    });

    return results.map(({ id, doc, highlight }) => ({
      collectionId: doc!.collectionId,
      documentId: id as DocumentId,
      matchedText: highlight!.text,
    }));
  }

  private importIndex(): void {
    if (this.indexLoaded) {
      return;
    }

    const flexsearchIndexes = this.db
      .prepare(`SELECT * FROM "${table}" WHERE "target" is 'document'`)
      .all() as SqliteFlexsearchIndex[];

    for (const { key, data } of flexsearchIndexes) {
      this.index.import(key, data);
    }

    this.indexLoaded = true;
  }

  private exportIndex(): void {
    const upsert = this.db.prepare(`
      INSERT INTO "${table}"
        ("key", "target", "data")
      VALUES
        (?, ?, ?)
      ON CONFLICT("key") DO UPDATE SET
        "target" = excluded."target",
        "data" = excluded."data"
    `);
    this.index.export((key, data) => upsert.run(key, "document", data));
  }
}

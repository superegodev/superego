import type { DatabaseSync } from "node:sqlite";
import type { CollectionId, DocumentId } from "@superego/backend";
import type { DocumentTextSearchIndex } from "@superego/executing-backend";
import type { TextChunks } from "@superego/schema";
import { Document as FlexsearchDocument } from "flexsearch";
import type SqliteDocumentTextSearchText from "../types/SqliteDocumentTextSearchText.js";

const table = "document_text_search_texts";

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
    this.loadIndexIfNeeded();

    const text = Object.values(textChunks).flat().join(" | ");

    this.db
      .prepare(`
        INSERT OR REPLACE INTO "${table}"
          ("document_id", "collection_id", "text")
        VALUES
          (?, ?, ?)
      `)
      .run(documentId, collectionId, text);

    this.index.remove(documentId);
    this.index.add({
      id: documentId,
      collectionId,
      text,
    });
  }

  async remove(
    _collectionId: CollectionId,
    documentId: DocumentId,
  ): Promise<void> {
    this.loadIndexIfNeeded();

    this.db
      .prepare(`DELETE FROM "${table}" WHERE "document_id" = ?`)
      .run(documentId);

    this.index.remove(documentId);
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
    this.loadIndexIfNeeded();

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

  private loadIndexIfNeeded(): void {
    if (this.indexLoaded) {
      return;
    }

    const documentTextSearchTexts = this.db
      .prepare(`SELECT * FROM "${table}"`)
      .all() as SqliteDocumentTextSearchText[];

    for (const {
      document_id,
      collection_id,
      text,
    } of documentTextSearchTexts) {
      this.index.add({
        id: document_id,
        collectionId: collection_id,
        text: text,
      });
    }

    this.indexLoaded = true;
  }
}

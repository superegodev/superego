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

export interface SearchTextIndexState {
  index: FlexsearchDocument<FlexsearchDocumentData>;
  isLoaded: boolean;
}

export default class SqliteDocumentTextSearchIndex
  implements DocumentTextSearchIndex
{
  constructor(
    private db: DatabaseSync,
    private searchTextIndexState: SearchTextIndexState,
    private onTransactionSucceeded: (callback: () => void) => void,
  ) {}

  async upsert(
    collectionId: CollectionId,
    documentId: DocumentId,
    textChunks: TextChunks,
  ): Promise<void> {
    const text = Object.values(textChunks).flat().join(" | ");
    this.db
      .prepare(`
        INSERT OR REPLACE INTO "${table}"
          ("document_id", "collection_id", "text")
        VALUES
          (?, ?, ?)
      `)
      .run(documentId, collectionId, text);

    this.onTransactionSucceeded(() => {
      this.searchTextIndexState.index.remove(documentId);
      this.searchTextIndexState.index.add({
        id: documentId,
        collectionId,
        text,
      });
    });
  }

  async remove(
    _collectionId: CollectionId,
    documentId: DocumentId,
  ): Promise<void> {
    this.db
      .prepare(`DELETE FROM "${table}" WHERE "document_id" = ?`)
      .run(documentId);

    this.onTransactionSucceeded(() =>
      this.searchTextIndexState.index.remove(documentId),
    );
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
    this.loadIndex();

    const results = this.searchTextIndexState.index.search(query, {
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

  private loadIndex(): void {
    if (this.searchTextIndexState.isLoaded) {
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
      this.searchTextIndexState.index.add({
        id: document_id,
        collectionId: collection_id,
        text: text,
      });
    }

    this.searchTextIndexState.isLoaded = true;
  }

  static getSearchTextIndexState(): SearchTextIndexState {
    return {
      index: new FlexsearchDocument<FlexsearchDocumentData>({
        document: {
          id: "id",
          index: ["text"],
          tag: ["collectionId"],
          store: ["collectionId", "text"],
        },
        tokenize: "forward",
        context: true,
      }),
      isLoaded: false,
    };
  }
}

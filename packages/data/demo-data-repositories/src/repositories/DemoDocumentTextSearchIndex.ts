import type { CollectionId, DocumentId } from "@superego/backend";
import type { DocumentTextSearchIndex } from "@superego/executing-backend";
import type { TextChunks } from "@superego/schema";
import { Document as FlexsearchDocument } from "flexsearch";
import type { DocumentTextSearchText } from "../Data.js";
import Disposable from "../utils/Disposable.js";

type FlexsearchDocumentData = {
  id: DocumentId;
  collectionId: CollectionId;
  text: string;
};

export interface SearchTextIndexState {
  index: FlexsearchDocument<FlexsearchDocumentData>;
  isLoaded: boolean;
}

export default class DemoDocumentTextSearchIndex
  extends Disposable
  implements DocumentTextSearchIndex
{
  constructor(
    private documentTextSearchTexts: Record<DocumentId, DocumentTextSearchText>,
    private searchTextIndexState: SearchTextIndexState,
    private onTransactionSucceeded: (callback: () => void) => void,
    private onWrite: () => void,
  ) {
    super();
  }

  async upsert(
    collectionId: CollectionId,
    documentId: DocumentId,
    textChunks: TextChunks,
  ): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    const text = Object.values(textChunks).flat().join(" | ");
    this.documentTextSearchTexts[documentId] = {
      documentId,
      collectionId,
      text,
    };
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
    this.ensureNotDisposed();
    this.onWrite();
    delete this.documentTextSearchTexts[documentId];
    this.onTransactionSucceeded(() => {
      this.searchTextIndexState.index.remove(documentId);
    });
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
    this.ensureNotDisposed();
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

    for (const { documentId, collectionId, text } of Object.values(
      this.documentTextSearchTexts,
    )) {
      this.searchTextIndexState.index.add({
        id: documentId,
        collectionId,
        text,
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

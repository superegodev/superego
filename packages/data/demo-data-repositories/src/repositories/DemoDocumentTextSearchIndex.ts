import type { CollectionId, DocumentId } from "@superego/backend";
import type { DocumentTextSearchIndex } from "@superego/executing-backend";
import type { TextChunks } from "@superego/schema";
import { Document as FlexsearchDocument } from "flexsearch";
import type { FlexsearchIndexData } from "../Data.js";
import Disposable from "../utils/Disposable.js";

type FlexsearchDocumentData = {
  id: DocumentId;
  collectionId: CollectionId;
  text: string;
};

const target = "document";

export default class DemoDocumentTextSearchIndex
  extends Disposable
  implements DocumentTextSearchIndex
{
  private index: FlexsearchDocument<FlexsearchDocumentData>;
  private indexLoaded = false;

  constructor(
    private flexsearchIndexes: FlexsearchIndexData[],
    private onWrite: () => void,
  ) {
    super();
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
    this.ensureNotDisposed();
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
    this.ensureNotDisposed();
    this.importIndex();
    this.index.remove(documentId);
    this.exportIndex();
  }

  async search(
    collectionId: CollectionId | null,
    query: string,
  ): Promise<
    {
      collectionId: CollectionId;
      documentId: DocumentId;
      matchedText: string;
    }[]
  > {
    this.ensureNotDisposed();
    this.importIndex();

    const results = this.index.search(query, {
      tag: collectionId ? { collectionId } : undefined,
      limit: 20,
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

    for (const { key, data } of this.flexsearchIndexes.filter(
      (i) => i.target === target,
    )) {
      this.index.import(key, data);
    }

    this.indexLoaded = true;
  }

  private exportIndex(): void {
    this.onWrite();

    const otherIndexes = this.flexsearchIndexes.filter(
      (index) => index.target !== target,
    );
    this.flexsearchIndexes.length = 0;
    this.flexsearchIndexes.push(...otherIndexes);

    this.index.export((key, data) => {
      this.flexsearchIndexes.push({ key, target, data });
    });
  }
}

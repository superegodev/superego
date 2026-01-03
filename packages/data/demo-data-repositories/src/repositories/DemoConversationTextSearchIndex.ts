import type { ConversationId } from "@superego/backend";
import type { ConversationTextSearchIndex } from "@superego/executing-backend";
import { Document as FlexsearchDocument } from "flexsearch";
import type { FlexsearchIndexData } from "../Data.js";
import Disposable from "../utils/Disposable.js";

type FlexsearchDocumentData = {
  id: ConversationId;
  text: string;
};

const target = "conversation";

export default class DemoConversationTextSearchIndex
  extends Disposable
  implements ConversationTextSearchIndex
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
    this.ensureNotDisposed();
    this.importIndex();
    this.index.remove(conversationId);
    this.index.add({
      id: conversationId,
      text: [...textChunks.title, ...textChunks.messages].join(" | "),
    });
    this.exportIndex();
  }

  async remove(conversationId: ConversationId): Promise<void> {
    this.ensureNotDisposed();
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
    this.ensureNotDisposed();
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

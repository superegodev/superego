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

export interface SearchTextIndexState {
  index: FlexsearchDocument<FlexsearchDocumentData>;
  isLoaded: boolean;
}

export default class DemoConversationTextSearchIndex
  extends Disposable
  implements ConversationTextSearchIndex
{
  constructor(
    private flexsearchIndexes: FlexsearchIndexData[],
    private searchTextIndexState: SearchTextIndexState,
    private onWrite: () => void,
  ) {
    super();
  }

  async upsert(
    conversationId: ConversationId,
    textChunks: { title: string[]; messages: string[] },
  ): Promise<void> {
    this.ensureNotDisposed();
    this.importIndex();
    this.searchTextIndexState.index.remove(conversationId);
    this.searchTextIndexState.index.add({
      id: conversationId,
      text: [...textChunks.title, ...textChunks.messages].join(" | "),
    });
    this.exportIndex();
  }

  async remove(conversationId: ConversationId): Promise<void> {
    this.ensureNotDisposed();
    this.importIndex();
    this.searchTextIndexState.index.remove(conversationId);
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

  private importIndex(): void {
    if (this.searchTextIndexState.isLoaded) {
      return;
    }

    for (const { key, data } of this.flexsearchIndexes.filter(
      (i) => i.target === target,
    )) {
      this.searchTextIndexState.index.import(key, data);
    }

    this.searchTextIndexState.isLoaded = true;
  }

  private exportIndex(): void {
    this.onWrite();

    const otherIndexes = this.flexsearchIndexes.filter(
      (index) => index.target !== target,
    );
    this.flexsearchIndexes.length = 0;
    this.flexsearchIndexes.push(...otherIndexes);

    this.searchTextIndexState.index.export((key, data) => {
      this.flexsearchIndexes.push({ key, target, data });
    });
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

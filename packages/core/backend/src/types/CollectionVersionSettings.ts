import type DefaultDocumentLayoutOptions from "./DefaultDocumentLayoutOptions.js";
import type TypescriptModule from "./TypescriptModule.js";

export default interface CollectionVersionSettings {
  /**
   * A function that computes blocking keys for a document's content. Used to
   * detect duplicate documents. Documents that share any blocking key are
   * considered duplicates. Null if duplicate detection is disabled.
   */
  contentBlockingKeysGetter: TypescriptModule | null;
  contentSummaryGetter: TypescriptModule;
  /** Layout options for the document form. Null means use defaults. */
  defaultDocumentLayoutOptions: DefaultDocumentLayoutOptions | null;
}

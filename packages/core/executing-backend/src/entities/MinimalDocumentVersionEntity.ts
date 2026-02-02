import type DocumentVersionEntity from "./DocumentVersionEntity.js";

type MinimalDocumentVersionEntity = Omit<
  DocumentVersionEntity,
  "content" | "contentBlockingKeys" | "contentSummary"
>;
export default MinimalDocumentVersionEntity;

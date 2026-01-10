import type DocumentVersion from "./DocumentVersion.js";

type MinimalDocumentVersion = Omit<
  DocumentVersion,
  "content" | "contentSummary"
>;
export default MinimalDocumentVersion;

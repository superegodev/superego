import type DocumentVersion from "./DocumentVersion.js";

type LiteDocumentVersion = Omit<DocumentVersion, "content">;
export default LiteDocumentVersion;

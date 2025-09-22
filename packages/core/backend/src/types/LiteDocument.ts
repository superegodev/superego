import type Document from "./Document.js";
import type LiteDocumentVersion from "./LiteDocumentVersion.js";

type LiteDocument = Omit<Document, "latestVersion"> & {
  latestVersion: LiteDocumentVersion;
};
export default LiteDocument;

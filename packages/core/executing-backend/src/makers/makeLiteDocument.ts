import type { Document, LiteDocument } from "@superego/backend";
import makeLiteDocumentVersion from "./makeLiteDocumentVersion.js";

export default function makeLiteDocument(document: Document): LiteDocument {
  return {
    ...document,
    latestVersion: makeLiteDocumentVersion(document.latestVersion),
  };
}

import type {
  Document,
  DocumentId,
  DocumentVersionId,
} from "@superego/backend";

export default interface AssistantDocument {
  id: DocumentId;
  versionId: DocumentVersionId;
  /**
   * Content is converted for the assistant to:
   * - Use local Instants instead of UTC.
   */
  content: any;
}

export function toAssistantDocument(document: Document): AssistantDocument {
  return {
    id: document.id,
    versionId: document.latestVersion.id,
    content: document.latestVersion.content,
  };
}

import type MessagePartType from "../enums/MessagePartType.js";
import type CollectionId from "../ids/CollectionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type DocumentVersionId from "../ids/DocumentVersionId.js";

type MessagePart = MessagePart.Text | MessagePart.DocumentCreated;
namespace MessagePart {
  export interface Text {
    type: MessagePartType.Text;
    content: string;
    contentType: "text/plain" | "text/markdown";
    // EVOLUTION: optional audio attached. Transcribed for user messages,
    // synthesized for assistant messages.
  }

  export interface DocumentCreated {
    type: MessagePartType.DocumentCreated;
    collectionId: CollectionId;
    documentId: DocumentId;
    documentVersionId: DocumentVersionId;
    documentContent: any;
  }
}
export default MessagePart;

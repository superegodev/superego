import type MessagePartType from "../enums/MessagePartType.js";
import type CollectionId from "../ids/CollectionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type DocumentVersionId from "../ids/DocumentVersionId.js";

type MessagePart =
  | MessagePart.Text
  | MessagePart.Audio
  | MessagePart.DocumentCreated;
namespace MessagePart {
  export interface Audio {
    type: MessagePartType.Audio;
    content: Uint8Array<ArrayBuffer>;
    contentType: "audio/wav";
    transcription: string;
  }

  export interface Text {
    type: MessagePartType.Text;
    content: string;
    contentType: "text/plain" | "text/markdown";
  }

  export interface DocumentCreated {
    type: MessagePartType.DocumentCreated;
    collectionId: CollectionId;
    documentId: DocumentId;
    documentVersionId: DocumentVersionId;
  }
}
export default MessagePart;

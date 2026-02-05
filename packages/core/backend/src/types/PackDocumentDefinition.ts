import type ProtoCollectionId from "../ids/ProtoCollectionId.js";
import type ProtoDocumentId from "../ids/ProtoDocumentId.js";

export default interface PackDocumentDefinition {
  protoId: ProtoDocumentId;
  collectionProtoId: ProtoCollectionId;
  content: any;
}

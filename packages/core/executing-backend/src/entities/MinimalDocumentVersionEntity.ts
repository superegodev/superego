import type DocumentVersionEntity from "./DocumentVersionEntity.js";

type MinimalDocumentVersionEntity = Omit<DocumentVersionEntity, "content">;
export default MinimalDocumentVersionEntity;

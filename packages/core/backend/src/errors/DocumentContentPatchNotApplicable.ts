import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type DocumentVersionId from "../ids/DocumentVersionId.js";

type DocumentContentPatchNotApplicable = ResultError<
  "DocumentContentPatchNotApplicable",
  {
    collectionId: CollectionId;
    documentId: DocumentId;
    latestVersionId: DocumentVersionId;
    operationIndex: number | null;
    path: string | null;
    cause: string;
  }
>;

export default DocumentContentPatchNotApplicable;

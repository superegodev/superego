import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";
import type CollectionVersionId from "../ids/CollectionVersionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type ExecutingJavascriptFunctionFailed from "./ExecutingJavascriptFunctionFailed.js";

type MakingContentBlockingKeysFailed = ResultError<
  "MakingContentBlockingKeysFailed",
  {
    collectionId: CollectionId;
    collectionVersionId: CollectionVersionId;
    documentId: DocumentId | null;
    cause:
      | ResultError<
          "ContentBlockingKeysNotValid",
          {
            contentBlockingKeys: any;
          }
        >
      | ExecutingJavascriptFunctionFailed;
  }
>;
export default MakingContentBlockingKeysFailed;

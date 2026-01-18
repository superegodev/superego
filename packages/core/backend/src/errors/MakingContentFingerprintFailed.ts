import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";
import type CollectionVersionId from "../ids/CollectionVersionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type ExecutingJavascriptFunctionFailed from "./ExecutingJavascriptFunctionFailed.js";

type MakingContentFingerprintFailed = ResultError<
  "MakingContentFingerprintFailed",
  {
    collectionId: CollectionId;
    collectionVersionId: CollectionVersionId;
    documentId: DocumentId | null;
    cause:
      | ResultError<
          "ContentFingerprintNotAString",
          {
            contentFingerprint: any;
          }
        >
      | ExecutingJavascriptFunctionFailed;
  }
>;
export default MakingContentFingerprintFailed;

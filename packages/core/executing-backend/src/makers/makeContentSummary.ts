import type {
  ContentSummary,
  ContentSummaryNotValid,
  DocumentId,
  DocumentVersionId,
  ExecutingJavascriptFunctionFailed,
} from "@superego/backend";
import type { Result } from "@superego/global-types";
import type CollectionVersionEntity from "../entities/CollectionVersionEntity.js";
import type JavascriptSandbox from "../requirements/JavascriptSandbox.js";
import makeContentSummaryResult from "./makeContentSummaryResult.js";

export default async function makeContentSummary(
  javascriptSandbox: JavascriptSandbox,
  collectionVersion: CollectionVersionEntity,
  documentVersionInfo: {
    id: DocumentVersionId;
    documentId: DocumentId;
    content: any;
  },
): Promise<
  Result<
    ContentSummary,
    ExecutingJavascriptFunctionFailed | ContentSummaryNotValid
  >
> {
  const result = await javascriptSandbox.executeSyncFunction(
    collectionVersion.settings.contentSummaryGetter,
    [documentVersionInfo.content],
  );
  return result.success
    ? makeContentSummaryResult(
        collectionVersion,
        documentVersionInfo,
        result.data,
      )
    : result;
}

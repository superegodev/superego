import type {
  ContentSummary,
  ContentSummaryNotValid,
  ExecutingJavascriptFunctionFailed,
} from "@superego/backend";
import type { Result } from "@superego/global-types";
import type CollectionVersionEntity from "../entities/CollectionVersionEntity.js";
import type DocumentVersionEntity from "../entities/DocumentVersionEntity.js";
import type JavascriptSandbox from "../requirements/JavascriptSandbox.js";
import makeContentSummaryResult from "./makeContentSummaryResult.js";

export default async function makeContentSummary(
  javascriptSandbox: JavascriptSandbox,
  collectionVersion: CollectionVersionEntity,
  documentVersion: DocumentVersionEntity,
): Promise<
  Result<
    ContentSummary,
    ExecutingJavascriptFunctionFailed | ContentSummaryNotValid
  >
> {
  const result = await javascriptSandbox.executeSyncFunction(
    collectionVersion.settings.contentSummaryGetter,
    [documentVersion.content],
  );
  return result.success
    ? makeContentSummaryResult(collectionVersion, documentVersion, result.data)
    : result;
}

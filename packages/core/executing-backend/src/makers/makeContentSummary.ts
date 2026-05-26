import type {
  ContentSummary,
  ContentSummaryNotValid,
  DocumentId,
  DocumentVersionId,
  ExecutingTypescriptFunctionFailed,
} from "@superego/backend";
import type { Result } from "@superego/global-types";
import { makeUnsuccessfulResult } from "@superego/shared-utils";
import type CollectionVersionEntity from "../entities/CollectionVersionEntity.js";
import type JavascriptSandbox from "../requirements/JavascriptSandbox.js";
import makeContentSummaryResult from "./makeContentSummaryResult.js";
import makeExecutingTypescriptFunctionFailed from "./makeExecutingTypescriptFunctionFailed.js";

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
    ExecutingTypescriptFunctionFailed | ContentSummaryNotValid
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
    : makeUnsuccessfulResult(
        makeExecutingTypescriptFunctionFailed(result.error),
      );
}

import type {
  ContentSummary,
  ContentSummaryNotValid,
  ExecutingJavascriptFunctionFailed,
  ValidationIssue,
} from "@superego/backend";
import type { Result } from "@superego/global-types";
import type CollectionVersionEntity from "../entities/CollectionVersionEntity.js";
import type DocumentVersionEntity from "../entities/DocumentVersionEntity.js";
import type JavascriptSandbox from "../requirements/JavascriptSandbox.js";
import isEmpty from "../utils/isEmpty.js";
import makeResultError from "./makeResultError.js";
import makeUnsuccessfulResult from "./makeUnsuccessfulResult.js";

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
  if (!result.success) {
    return result;
  }

  const { data: contentSummary } = result;
  const issues: ValidationIssue[] = [];
  if (contentSummary === null || typeof contentSummary !== "object") {
    issues.push({ message: "Content summary is not an object" });
  }
  for (const [key, value] of Object.entries(contentSummary)) {
    if (typeof value !== "string") {
      issues.push({ message: "Not a string", path: [{ key }] });
    }
  }
  if (!isEmpty(issues)) {
    return makeUnsuccessfulResult(
      makeResultError("ContentSummaryNotValid", {
        collectionId: collectionVersion.collectionId,
        collectionVersionId: collectionVersion.id,
        documentId: documentVersion.documentId,
        documentVersionId: documentVersion.id,
        issues: issues,
      }),
    );
  }

  return result;
}

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
import type TypescriptSandbox from "../requirements/TypescriptSandbox.js";
import makeContentSummaryResult from "./makeContentSummaryResult.js";
import makeExecutingTypescriptFunctionFailed from "./makeExecutingTypescriptFunctionFailed.js";

export default async function makeContentSummaries(
  typescriptSandbox: TypescriptSandbox,
  collectionVersion: CollectionVersionEntity,
  documentVersionInfos: {
    id: DocumentVersionId;
    documentId: DocumentId;
    content: any;
  }[],
): Promise<
  Result<
    ContentSummary,
    ExecutingTypescriptFunctionFailed | ContentSummaryNotValid
  >[]
> {
  const contentSummariesGetter = [
    collectionVersion.settings.contentSummaryGetter.replace(
      "export default",
      `const ${vars.getContentSummary} =`,
    ),
    `export default function ${vars.getContentSummaries}(${vars.documents}) {`,
    `  return ${vars.documents}.map(${vars.document} => ${vars.getContentSummary}(${vars.document}));`,
    "}",
    "",
  ].join("\n");
  const result = await typescriptSandbox.executeSyncFunction(
    contentSummariesGetter,
    [documentVersionInfos.map((documentVersion) => documentVersion.content)],
  );
  if (!result.success) {
    return documentVersionInfos.map(() =>
      makeUnsuccessfulResult(
        makeExecutingTypescriptFunctionFailed(result.error),
      ),
    );
  }

  const contentSummaries = result.data as any[];
  return documentVersionInfos.map((documentVersionInfo, index) =>
    makeContentSummaryResult(
      collectionVersion,
      documentVersionInfo,
      contentSummaries[index],
    ),
  );
}

const vars = {
  getContentSummary: addRandomPrefix("getContentSummary"),
  getContentSummaries: addRandomPrefix("getContentSummaries"),
  documents: addRandomPrefix("documents"),
  document: addRandomPrefix("document"),
};

function addRandomPrefix(variableName: string): string {
  const [prefix] = crypto.randomUUID().split("-");
  return `$${prefix}_${variableName}`;
}

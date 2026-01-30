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

export default async function makeContentSummaries(
  javascriptSandbox: JavascriptSandbox,
  collectionVersion: CollectionVersionEntity,
  documentVersionInfos: {
    id: DocumentVersionId;
    documentId: DocumentId;
    content: any;
  }[],
): Promise<
  Result<
    ContentSummary,
    ExecutingJavascriptFunctionFailed | ContentSummaryNotValid
  >[]
> {
  const contentSummariesGetter = {
    source: "",
    compiled: [
      collectionVersion.settings.contentSummaryGetter.compiled.replace(
        "export default",
        `const ${vars.getContentSummary} =`,
      ),
      `export default function ${vars.getContentSummaries}(${vars.documents}) {`,
      `  return ${vars.documents}.map(${vars.document} => ${vars.getContentSummary}(${vars.document}));`,
      "}",
      "",
    ].join("\n"),
  };
  const result = await javascriptSandbox.executeSyncFunction(
    contentSummariesGetter,
    [documentVersionInfos.map((documentVersion) => documentVersion.content)],
  );
  if (!result.success) {
    return documentVersionInfos.map(() => result);
  }

  const contentSummaries = result.data as any[];
  return documentVersionInfos.map((documentVersion, index) =>
    makeContentSummaryResult(
      collectionVersion,
      documentVersion,
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

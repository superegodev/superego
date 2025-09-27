import type { DocumentVersion } from "@superego/backend";
import { valibotSchemas } from "@superego/shared-utils";
import * as v from "valibot";
import type CollectionVersionEntity from "../entities/CollectionVersionEntity.js";
import type DocumentVersionEntity from "../entities/DocumentVersionEntity.js";
import makeResultError from "./makeResultError.js";
import makeSuccessfulResult from "./makeSuccessfulResult.js";
import makeUnsuccessfulResult from "./makeUnsuccessfulResult.js";
import makeValidationIssues from "./makeValidationIssues.js";

export default function makeContentSummaryResult(
  collectionVersion: CollectionVersionEntity,
  documentVersion: DocumentVersionEntity,
  contentSummary: unknown,
): DocumentVersion["contentSummary"] {
  const validationResult = v.safeParse(
    valibotSchemas.contentSummary(),
    contentSummary,
  );
  return validationResult.success
    ? makeSuccessfulResult(validationResult.output)
    : makeUnsuccessfulResult(
        makeResultError("ContentSummaryNotValid", {
          collectionId: collectionVersion.collectionId,
          collectionVersionId: collectionVersion.id,
          documentId: documentVersion.documentId,
          documentVersionId: documentVersion.id,
          issues: makeValidationIssues(validationResult.issues),
        }),
      );
}

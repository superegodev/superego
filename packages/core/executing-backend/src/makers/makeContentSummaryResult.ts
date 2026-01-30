import type {
  DocumentId,
  DocumentVersion,
  DocumentVersionId,
} from "@superego/backend";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
  valibotSchemas,
} from "@superego/shared-utils";
import * as v from "valibot";
import type CollectionVersionEntity from "../entities/CollectionVersionEntity.js";
import makeResultError from "./makeResultError.js";
import makeValidationIssues from "./makeValidationIssues.js";

export default function makeContentSummaryResult(
  collectionVersion: CollectionVersionEntity,
  documentVersionInfo: { id: DocumentVersionId; documentId: DocumentId },
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
          documentId: documentVersionInfo.documentId,
          documentVersionId: documentVersionInfo.id,
          issues: makeValidationIssues(validationResult.issues),
        }),
      );
}

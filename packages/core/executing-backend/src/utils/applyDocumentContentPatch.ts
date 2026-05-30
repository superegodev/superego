import type {
  CollectionId,
  DocumentContentPatchNotValid,
  DocumentId,
  DocumentVersionId,
  JsonPatchOperation,
} from "@superego/backend";
import type { Result } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import jsonPatch, { type Operation } from "fast-json-patch";
import makeResultError from "../makers/makeResultError.js";

const { applyPatch, JsonPatchError } = jsonPatch;

export default function applyDocumentContentPatch(
  collectionId: CollectionId,
  documentId: DocumentId,
  latestVersionId: DocumentVersionId,
  content: unknown,
  patch: JsonPatchOperation[],
): Result<unknown, DocumentContentPatchNotValid> {
  try {
    const result = applyPatch(
      structuredClone(content),
      structuredClone(patch) as Operation[],
      true,
      true,
    );
    return makeSuccessfulResult(result.newDocument);
  } catch (error) {
    return makeUnsuccessfulResult(
      makeResultError("DocumentContentPatchNotValid", {
        collectionId,
        documentId,
        latestVersionId,
        operationIndex: getOperationIndex(error),
        path: getOperationPath(error),
        cause: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

function getOperationIndex(error: unknown): number | null {
  if (error instanceof JsonPatchError && error.index !== undefined) {
    return error.index;
  }
  return null;
}

function getOperationPath(error: unknown): string | null {
  if (
    error instanceof JsonPatchError &&
    typeof error.operation?.path === "string"
  ) {
    return error.operation.path;
  }
  return null;
}

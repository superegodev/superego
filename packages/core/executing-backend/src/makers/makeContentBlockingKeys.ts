import type {
  DocumentId,
  MakingContentBlockingKeysFailed,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import type CollectionVersionEntity from "../entities/CollectionVersionEntity.js";
import type TypescriptSandbox from "../requirements/TypescriptSandbox.js";
import makeExecutingTypescriptFunctionFailed from "./makeExecutingTypescriptFunctionFailed.js";
import makeResultError from "./makeResultError.js";

export default async function makeContentBlockingKeys(
  typescriptSandbox: TypescriptSandbox,
  collectionVersion: CollectionVersionEntity,
  documentId: DocumentId | null,
  content: any,
): ResultPromise<string[], MakingContentBlockingKeysFailed> {
  const contentBlockingKeysGetter =
    collectionVersion.settings.contentBlockingKeysGetter!;

  const { data: contentBlockingKeys, error } =
    await typescriptSandbox.executeSyncFunction(contentBlockingKeysGetter, [
      content,
    ]);

  if (error) {
    return makeUnsuccessfulResult(
      makeResultError("MakingContentBlockingKeysFailed", {
        collectionId: collectionVersion.collectionId,
        collectionVersionId: collectionVersion.id,
        documentId: documentId,
        cause: makeExecutingTypescriptFunctionFailed(error),
      }),
    );
  }

  if (
    !Array.isArray(contentBlockingKeys) ||
    !contentBlockingKeys.every((key) => typeof key === "string")
  ) {
    return makeUnsuccessfulResult(
      makeResultError("MakingContentBlockingKeysFailed", {
        collectionId: collectionVersion.collectionId,
        collectionVersionId: collectionVersion.id,
        documentId: documentId,
        cause: makeResultError("ContentBlockingKeysNotValid", {
          contentBlockingKeys,
        }),
      }),
    );
  }

  return makeSuccessfulResult(contentBlockingKeys);
}

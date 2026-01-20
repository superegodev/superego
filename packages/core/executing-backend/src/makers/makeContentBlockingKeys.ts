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
import type JavascriptSandbox from "../requirements/JavascriptSandbox.js";
import makeResultError from "./makeResultError.js";

export default async function makeContentBlockingKeys(
  javascriptSandbox: JavascriptSandbox,
  collectionVersion: CollectionVersionEntity,
  documentId: DocumentId | null,
  content: any,
): ResultPromise<string[], MakingContentBlockingKeysFailed> {
  const contentBlockingKeysGetter =
    collectionVersion.contentBlockingKeysGetter!;

  const { data: contentBlockingKeys, error } =
    await javascriptSandbox.executeSyncFunction(contentBlockingKeysGetter, [
      content,
    ]);

  if (error) {
    return makeUnsuccessfulResult(
      makeResultError("MakingContentBlockingKeysFailed", {
        collectionId: collectionVersion.collectionId,
        collectionVersionId: collectionVersion.id,
        documentId: documentId,
        cause: error,
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

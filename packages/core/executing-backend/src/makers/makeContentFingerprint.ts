import type {
  DocumentId,
  MakingContentFingerprintFailed,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import type CollectionVersionEntity from "../entities/CollectionVersionEntity.js";
import type JavascriptSandbox from "../requirements/JavascriptSandbox.js";
import makeResultError from "./makeResultError.js";

export default async function makeContentFingerprint(
  javascriptSandbox: JavascriptSandbox,
  collectionVersion: CollectionVersionEntity,
  documentId: DocumentId | null,
  content: any,
): ResultPromise<string, MakingContentFingerprintFailed> {
  const contentFingerprintGetter =
    collectionVersion.settings.contentFingerprintGetter!;

  const { data: contentFingerprint, error } =
    await javascriptSandbox.executeSyncFunction(contentFingerprintGetter, [
      content,
    ]);

  if (error) {
    return makeUnsuccessfulResult(
      makeResultError("MakingContentFingerprintFailed", {
        collectionId: collectionVersion.collectionId,
        collectionVersionId: collectionVersion.id,
        documentId: documentId,
        cause: error,
      }),
    );
  }

  if (typeof contentFingerprint !== "string") {
    return makeUnsuccessfulResult(
      makeResultError("MakingContentFingerprintFailed", {
        collectionId: collectionVersion.collectionId,
        collectionVersionId: collectionVersion.id,
        documentId: documentId,
        cause: makeResultError("ContentFingerprintNotAString", {
          contentFingerprint,
        }),
      }),
    );
  }

  return makeSuccessfulResult(contentFingerprint);
}

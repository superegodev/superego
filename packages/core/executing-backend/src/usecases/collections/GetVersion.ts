import type {
  Backend,
  CollectionId,
  CollectionVersion,
  CollectionVersionId,
  CollectionVersionNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import makeCollectionVersion from "../../makers/makeCollectionVersion.js";
import makeResultError from "../../makers/makeResultError.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class CollectionsGetVersion extends BackendUsecase<
  Backend["collections"]["getVersion"]
> {
  argumentsSchema = v.tuple([
    structuralSchemas.backend.ids.collectionId(),
    structuralSchemas.backend.ids.collectionVersionId(),
  ]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.collectionVersion(),
    [
      structuralSchemas.backend.errors.collectionVersionNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

  async exec(
    collectionId: CollectionId,
    collectionVersionId: CollectionVersionId,
  ): ResultPromise<
    CollectionVersion,
    CollectionVersionNotFound | UnexpectedError
  > {
    const collectionVersion =
      await this.repos.collectionVersion.find(collectionVersionId);

    if (!collectionVersion || collectionVersion.collectionId !== collectionId) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionVersionNotFound", {
          collectionId,
          collectionVersionId,
        }),
      );
    }

    return makeSuccessfulResult(makeCollectionVersion(collectionVersion));
  }
}

import type {
  Backend,
  Collection,
  CollectionId,
  CollectionNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import makeCollection from "../../makers/makeCollection.js";
import makeResultError from "../../makers/makeResultError.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class CollectionsGet extends BackendUsecase<
  Backend["collections"]["get"]
> {
  argumentsSchema = v.tuple([structuralSchemas.backend.ids.collectionId()]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.collection(),
    [
      structuralSchemas.backend.errors.collectionNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

  async exec(
    id: CollectionId,
  ): ResultPromise<Collection, CollectionNotFound | UnexpectedError> {
    const collection = await this.repos.collection.find(id);
    if (!collection) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionNotFound", { collectionId: id }),
      );
    }

    const latestVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(id);
    assertCollectionVersionExists(id, latestVersion);

    return makeSuccessfulResult(makeCollection(collection, latestVersion));
  }
}

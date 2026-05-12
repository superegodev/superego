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
import Usecase from "../../utils/Usecase.js";
import { collectionVersion as collectionVersionSchema } from "../../validation/domain/collection.js";
import {
  collectionVersionNotFound,
  unexpectedError,
} from "../../validation/errors.js";
import {
  collectionId as collectionIdSchema,
  collectionVersionId as collectionVersionIdSchema,
} from "../../validation/helpers/idSchemas.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class CollectionsGetVersion extends Usecase<
  Backend["collections"]["getVersion"]
> {
  argumentsSchema = v.tuple([
    collectionIdSchema(),
    collectionVersionIdSchema(),
  ]);
  resultSchema = makeResultSchema(collectionVersionSchema(), [
    collectionVersionNotFound(),
    unexpectedError(),
  ]);

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

import type {
  Backend,
  CollectionNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { codegen } from "@superego/schema";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import makeResultError from "../../makers/makeResultError.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class CollectionsGetTypescriptSchema extends BackendUsecase<
  Backend["collections"]["getTypescriptSchema"]
> {
  argumentsSchema = v.tuple([structuralSchemas.backend.ids.collectionId()]);
  resultSchema = structuralSchemas.global.result(
    v.strictObject({ typescriptSchema: v.string() }),
    [
      structuralSchemas.backend.errors.collectionNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

  async exec(
    collectionId: Parameters<Backend["collections"]["getTypescriptSchema"]>[0],
  ): ResultPromise<
    { typescriptSchema: string },
    CollectionNotFound | UnexpectedError
  > {
    const collection = await this.repos.collection.find(collectionId);
    if (!collection) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionNotFound", { collectionId }),
      );
    }

    const latestVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(
        collectionId,
      );
    assertCollectionVersionExists(collectionId, latestVersion);

    return makeSuccessfulResult({
      typescriptSchema: codegen(latestVersion.schema),
    });
  }
}

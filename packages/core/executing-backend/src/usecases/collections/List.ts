import type {
  Backend,
  Collection,
  CollectionId,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class CollectionsList extends BackendUsecase<
  Backend["collections"]["list"]
> {
  argumentsSchema = v.tuple([]);
  resultSchema = structuralSchemas.global.result(
    v.array(structuralSchemas.backend.types.collection()),
    [structuralSchemas.backend.errors.unexpectedError()],
  );

  async exec(): ResultPromise<Collection[], UnexpectedError> {
    const collections = await this.repos.collection.findAll();
    const latestVersions = await this.repos.collectionVersion.findAllLatests();
    const latestVersionsByCollectionId = new Map<
      CollectionId,
      CollectionVersionEntity
    >();
    latestVersions.forEach((latestVersion) => {
      latestVersionsByCollectionId.set(
        latestVersion.collectionId,
        latestVersion,
      );
    });

    return makeSuccessfulResult(
      collections.map((collection) => {
        const latestVersion = latestVersionsByCollectionId.get(collection.id);
        assertCollectionVersionExists(collection.id, latestVersion);
        return makeCollection(
          collection,
          latestVersion,
          this.getConnector(collection),
        );
      }),
    );
  }
}

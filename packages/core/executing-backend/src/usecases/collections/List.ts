import type {
  Backend,
  Collection,
  CollectionId,
  LiteCollection,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeLiteCollection from "../../makers/makeLiteCollection.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class CollectionsList extends BackendUsecase<
  Backend["collections"]["list"]
> {
  // The public Backend signature has overloads but `Parameters<>` resolves to
  // the last (widest) one: `(lite?: false)`.
  argumentsSchema = v.tuple([v.optional(v.literal(false))]);
  resultSchema = structuralSchemas.global.result(
    v.array(
      v.union([
        structuralSchemas.backend.types.liteCollection(),
        structuralSchemas.backend.types.collection(),
      ]),
    ),
    [structuralSchemas.backend.errors.unexpectedError()],
  );

  async exec(): ResultPromise<LiteCollection[], UnexpectedError>;
  async exec(lite: false): ResultPromise<Collection[], UnexpectedError>;
  async exec(
    lite = true,
  ): ResultPromise<(LiteCollection | Collection)[], UnexpectedError> {
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
      collections.map((collectionEntity) => {
        const latestVersion = latestVersionsByCollectionId.get(
          collectionEntity.id,
        );
        assertCollectionVersionExists(collectionEntity.id, latestVersion);
        const collection = makeCollection(collectionEntity, latestVersion);
        return lite ? makeLiteCollection(collection) : collection;
      }),
    );
  }
}

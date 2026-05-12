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
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import Usecase from "../../utils/Usecase.js";
import { collection } from "../../validation/domain/collection.js";
import { unexpectedError } from "../../validation/errors.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class CollectionsList extends Usecase<
  Backend["collections"]["list"]
> {
  argumentsSchema = v.tuple([]);
  resultSchema = makeResultSchema(v.array(collection()), [unexpectedError()]);

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
      collections.map((coll) => {
        const latestVersion = latestVersionsByCollectionId.get(coll.id);
        assertCollectionVersionExists(coll.id, latestVersion);
        return makeCollection(coll, latestVersion, this.getConnector(coll));
      }),
    );
  }
}

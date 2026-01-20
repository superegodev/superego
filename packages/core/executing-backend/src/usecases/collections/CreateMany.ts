import type {
  AppNotFound,
  Backend,
  Collection,
  CollectionCategoryNotFound,
  CollectionSchemaNotValid,
  CollectionSettings,
  CollectionSettingsNotValid,
  CollectionVersionSettings,
  ContentFingerprintGetterNotValid,
  ContentSummaryGetterNotValid,
  ReferencedCollectionsNotFound,
  TypescriptModule,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { type Schema, utils as schemaUtils } from "@superego/schema";
import {
  Id,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import makeResultError from "../../makers/makeResultError.js";
import Usecase from "../../utils/Usecase.js";
import CollectionsCreate from "./Create.js";

interface CollectionsCreateManyOptions {
  dryRun?: boolean;
}

export default class CollectionsCreateMany extends Usecase<
  Backend["collections"]["createMany"]
> {
  async exec(
    collections: {
      settings: CollectionSettings;
      schema: Schema;
      versionSettings: CollectionVersionSettings;
      contentFingerprintGetter: TypescriptModule | null;
    }[],
    options: CollectionsCreateManyOptions = {},
  ): ResultPromise<
    Collection[],
    | CollectionSettingsNotValid
    | CollectionCategoryNotFound
    | AppNotFound
    | CollectionSchemaNotValid
    | ReferencedCollectionsNotFound
    | ContentSummaryGetterNotValid
    | ContentFingerprintGetterNotValid
    | UnexpectedError
  > {
    const collectionIds = collections.map(() => Id.generate.collection());
    const idMapping = schemaUtils.makeProtoCollectionIdMapping(collectionIds);

    const collectionsCreate = this.sub(CollectionsCreate);
    const createdCollections: Collection[] = [];

    for (const [index, collection] of collections.entries()) {
      const { settings, schema, versionSettings, contentFingerprintGetter } =
        collection;
      const collectionId = collectionIds[index];

      const protoCollectionIds = schemaUtils.extractProtoCollectionIds(schema);

      // Validate references to proto collections.
      const notFoundProtoCollectionIds = protoCollectionIds.filter(
        (id) => !idMapping.has(id),
      );
      if (notFoundProtoCollectionIds.length > 0) {
        return makeUnsuccessfulResult(
          makeResultError("ReferencedCollectionsNotFound", {
            collectionId: null,
            notFoundCollectionIds: notFoundProtoCollectionIds,
          }),
        );
      }

      const resolvedSchema = schemaUtils.replaceProtoCollectionIds(
        schema,
        idMapping,
      );

      const createResult = await collectionsCreate.exec(
        settings,
        resolvedSchema,
        versionSettings,
        contentFingerprintGetter,
        {
          dryRun: options.dryRun,
          collectionId: collectionId,
          allowedUnverifiedCollectionIds: collectionIds,
        },
      );

      if (createResult.error) {
        return makeUnsuccessfulResult(createResult.error);
      }

      createdCollections.push(createResult.data);
    }

    return makeSuccessfulResult(createdCollections);
  }
}

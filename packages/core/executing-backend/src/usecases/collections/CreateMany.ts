import type {
  AppId,
  AppNotFound,
  Backend,
  Collection,
  CollectionCategoryNotFound,
  CollectionDefinition,
  CollectionId,
  CollectionSchemaNotValid,
  CollectionSettingsNotValid,
  ContentBlockingKeysGetterNotValid,
  ContentSummaryGetterNotValid,
  DefaultDocumentViewUiOptionsNotValid,
  ReferencedCollectionsNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  Id,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
  valibotSchemas,
} from "@superego/shared-utils";
import * as v from "valibot";
import makeResultError from "../../makers/makeResultError.js";
import * as argSchemas from "../../utils/argSchemas.js";
import {
  extractProtoCollectionIds,
  makeProtoCollectionIdMapping,
  replaceProtoCollectionIds,
} from "../../utils/ProtoIdUtils.js";
import Usecase from "../../utils/Usecase.js";
import validateArgs from "../../utils/validateArgs.js";
import CollectionsCreate from "./Create.js";

interface CollectionsCreateManyOptions {
  dryRun?: boolean;
  collectionIds?: CollectionId[];
  skipReferenceCheckForAppIds?: AppId[];
}

const collectionsCreateManyOptionsSchema = v.strictObject({
  dryRun: v.optional(v.boolean()),
  collectionIds: v.optional(v.array(valibotSchemas.id.collection())),
  skipReferenceCheckForAppIds: v.optional(v.array(valibotSchemas.id.app())),
});

export default class CollectionsCreateMany extends Usecase<
  Backend["collections"]["createMany"]
> {
  @validateArgs([
    v.array(argSchemas.collectionDefinition()),
    collectionsCreateManyOptionsSchema,
  ])
  async exec(
    definitions: CollectionDefinition[],
    options: CollectionsCreateManyOptions = {},
  ): ResultPromise<
    Collection[],
    | CollectionSettingsNotValid
    | CollectionCategoryNotFound
    | AppNotFound
    | CollectionSchemaNotValid
    | ReferencedCollectionsNotFound
    | ContentBlockingKeysGetterNotValid
    | ContentSummaryGetterNotValid
    | DefaultDocumentViewUiOptionsNotValid
    | UnexpectedError
  > {
    const collectionIds =
      options.collectionIds ?? definitions.map(() => Id.generate.collection());
    const idMapping = makeProtoCollectionIdMapping(collectionIds);

    const collectionsCreate = this.sub(CollectionsCreate);
    const createdCollections: Collection[] = [];

    for (const [index, definition] of definitions.entries()) {
      const { settings, schema, versionSettings } = definition;
      const collectionId = collectionIds[index];

      // Validate references to proto collections.
      const notFoundProtoCollectionIds =
        extractProtoCollectionIds(schema).difference(idMapping);
      if (notFoundProtoCollectionIds.size > 0) {
        return makeUnsuccessfulResult(
          makeResultError("ReferencedCollectionsNotFound", {
            collectionId: null,
            notFoundCollectionIds: [...notFoundProtoCollectionIds],
          }),
        );
      }

      const resolvedSchema = replaceProtoCollectionIds(schema, idMapping);

      const createResult = await collectionsCreate.exec(
        { settings, schema: resolvedSchema, versionSettings },
        {
          dryRun: options.dryRun,
          collectionId: collectionId,
          skipReferenceCheckForCollectionIds: collectionIds,
          skipReferenceCheckForAppIds: options.skipReferenceCheckForAppIds,
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

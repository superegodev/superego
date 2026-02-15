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
} from "@superego/shared-utils";
import makeResultError from "../../makers/makeResultError.js";
import {
  extractProtoCollectionIds,
  makeProtoCollectionIdMapping,
  replaceProtoCollectionIds,
} from "../../utils/ProtoIdUtils.js";
import Usecase from "../../utils/Usecase.js";
import CollectionsCreate from "./Create.js";

interface CollectionsCreateManyOptions {
  dryRun?: boolean;
  collectionIds?: CollectionId[];
  skipReferenceCheckForAppIds?: AppId[];
}

export default class CollectionsCreateMany extends Usecase<
  Backend["collections"]["createMany"]
> {
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

import type {
  Collection,
  CollectionDefinition,
  CollectionSettings,
  CollectionVersion,
  CollectionVersionSettings,
} from "@superego/backend";
import { valibotSchemas as schemaValibotSchemas } from "@superego/schema";
import * as v from "valibot";
import {
  appId,
  collectionCategoryId,
  collectionVersionId,
  protoAppId,
  protoCollectionCategoryId,
} from "../helpers/idSchemas.js";
import { collectionId } from "../helpers/idSchemas.js";
import { defaultDocumentViewUiOptions } from "./defaultDocumentViewUiOptions.js";
import { remote, remoteConverters } from "./remote.js";
import { typescriptModule } from "./typescript.js";

export function collectionSettings(): v.GenericSchema<
  unknown,
  CollectionSettings
> {
  return v.looseObject({
    name: v.string(),
    icon: v.nullable(v.string()),
    collectionCategoryId: v.nullable(collectionCategoryId()),
    defaultCollectionViewAppId: v.nullable(appId()),
    description: v.nullable(v.string()),
    assistantInstructions: v.nullable(v.string()),
    redirectToCollectionAfterDocumentCreation: v.boolean(),
  });
}

export function collectionVersionSettings(): v.GenericSchema<
  unknown,
  CollectionVersionSettings
> {
  return v.looseObject({
    contentBlockingKeysGetter: v.nullable(typescriptModule()),
    contentSummaryGetter: typescriptModule(),
    defaultDocumentViewUiOptions: v.nullable(defaultDocumentViewUiOptions()),
  });
}

export function collectionVersion(): v.GenericSchema<
  unknown,
  CollectionVersion
> {
  return v.looseObject({
    id: collectionVersionId(),
    previousVersionId: v.nullable(collectionVersionId()),
    schema: schemaValibotSchemas.schema(),
    settings: collectionVersionSettings(),
    migration: v.nullable(typescriptModule()),
    remoteConverters: v.nullable(remoteConverters()),
    createdAt: v.date(),
  });
}

export function collection(): v.GenericSchema<unknown, Collection> {
  return v.looseObject({
    id: collectionId(),
    latestVersion: collectionVersion(),
    settings: collectionSettings(),
    remote: v.nullable(remote()),
    createdAt: v.date(),
  });
}

/**
 * Structural-only shape check for a `Schema`. Used in argument schemas, where
 * the full semantic validation (`schemaValibotSchemas.schema()`, which also
 * enforces rules like "root type must be a Struct") is left to the usecase so
 * it can surface a `CollectionSchemaNotValid` error instead of a generic
 * `ArgumentsNotValid`.
 */
export function schemaShape() {
  return v.looseObject({
    types: v.record(v.string(), v.looseObject({})),
    rootType: v.string(),
  });
}

export function collectionDefinition(): v.GenericSchema<
  unknown,
  CollectionDefinition<false, false>
> {
  return v.looseObject({
    settings: v.looseObject({
      name: v.string(),
      icon: v.nullable(v.string()),
      collectionCategoryId: v.nullable(collectionCategoryId()),
      defaultCollectionViewAppId: v.nullable(appId()),
      description: v.nullable(v.string()),
      assistantInstructions: v.nullable(v.string()),
      redirectToCollectionAfterDocumentCreation: v.boolean(),
    }),
    schema: schemaShape(),
    versionSettings: collectionVersionSettings(),
  }) as unknown as v.GenericSchema<unknown, CollectionDefinition<false, false>>;
}

export function protoCollectionDefinition(): v.GenericSchema<
  unknown,
  CollectionDefinition<true, true>
> {
  return v.looseObject({
    settings: v.looseObject({
      name: v.string(),
      icon: v.nullable(v.string()),
      collectionCategoryId: v.nullable(
        v.union([protoCollectionCategoryId(), collectionCategoryId()]),
      ),
      defaultCollectionViewAppId: v.nullable(v.union([protoAppId(), appId()])),
      description: v.nullable(v.string()),
      assistantInstructions: v.nullable(v.string()),
      redirectToCollectionAfterDocumentCreation: v.boolean(),
    }),
    schema: schemaShape(),
    versionSettings: collectionVersionSettings(),
  }) as unknown as v.GenericSchema<unknown, CollectionDefinition<true, true>>;
}

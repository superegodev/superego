import type {
  Collection,
  CollectionDefinition,
  CollectionSettings,
  CollectionVersion,
  CollectionVersionSettings,
  LiteCollection,
  LiteCollectionVersion,
} from "@superego/backend";
import { valibotSchemas as schemaValibotSchemas } from "@superego/schema";
import * as v from "valibot";
import { schemaShape } from "../../schema/index.js";
import {
  appId,
  collectionCategoryId,
  collectionId,
  collectionVersionId,
  protoAppId,
  protoCollectionCategoryId,
} from "../ids.js";
import { defaultDocumentViewUiOptions } from "./defaultDocumentViewUiOptions.js";
import { typescriptModule } from "./typescript.js";

export function collectionSettings(): v.GenericSchema<
  unknown,
  CollectionSettings
> {
  return v.strictObject({
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
  return v.strictObject({
    contentBlockingKeysGetter: v.nullable(typescriptModule()),
    contentSummaryGetter: typescriptModule(),
    defaultDocumentViewUiOptions: v.nullable(defaultDocumentViewUiOptions()),
  });
}

export function collectionVersion(): v.GenericSchema<
  unknown,
  CollectionVersion
> {
  return v.strictObject({
    id: collectionVersionId(),
    previousVersionId: v.nullable(collectionVersionId()),
    schema: schemaValibotSchemas.schema(),
    settings: collectionVersionSettings(),
    migration: v.nullable(typescriptModule()),
    createdAt: v.date(),
  });
}

export function liteCollectionVersion(): v.GenericSchema<
  unknown,
  LiteCollectionVersion
> {
  return v.strictObject({
    id: collectionVersionId(),
    previousVersionId: v.nullable(collectionVersionId()),
    createdAt: v.date(),
  });
}

export function collection(): v.GenericSchema<unknown, Collection> {
  return v.strictObject({
    id: collectionId(),
    latestVersion: collectionVersion(),
    settings: collectionSettings(),
    createdAt: v.date(),
  });
}

export function liteCollection(): v.GenericSchema<unknown, LiteCollection> {
  return v.strictObject({
    id: collectionId(),
    latestVersion: liteCollectionVersion(),
    settings: collectionSettings(),
    createdAt: v.date(),
  }) as v.GenericSchema<unknown, LiteCollection>;
}

export function collectionDefinition(): v.GenericSchema<
  unknown,
  CollectionDefinition<false, false>
> {
  return v.strictObject({
    settings: v.strictObject({
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
  return v.strictObject({
    settings: v.strictObject({
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

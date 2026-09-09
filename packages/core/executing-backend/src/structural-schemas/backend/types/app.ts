import {
  type App,
  type AppDefinition,
  AppType,
  type AppVersion,
} from "@superego/backend";
import { type Schema } from "@superego/schema";
import { valibotSchemas } from "@superego/shared-utils";
import * as v from "valibot";
import { schemaShape } from "../../schema/index.js";
import {
  appId,
  appVersionId,
  collectionId,
  collectionVersionId,
  protoCollectionId,
} from "../ids.js";
import { typescriptModule } from "./typescript.js";

export function appVersion(): v.GenericSchema<unknown, AppVersion> {
  return v.strictObject({
    stateDefinition: appStateDefinition(),
    id: appVersionId(),
    targetCollections: v.array(
      v.strictObject({
        id: collectionId(),
        versionId: collectionVersionId(),
      }),
    ),
    files: v.strictObject({
      "/main.tsx": typescriptModule(),
    }),
    createdAt: v.date(),
  });
}

export function app(): v.GenericSchema<unknown, App> {
  return v.strictObject({
    id: appId(),
    type: v.picklist(Object.values(AppType)),
    name: v.string(),
    permissions: valibotSchemas.appPermissions(),
    latestVersion: appVersion(),
    createdAt: v.date(),
  });
}

export function appDefinition(): v.GenericSchema<
  unknown,
  AppDefinition<false>
> {
  return v.strictObject({
    type: v.picklist(Object.values(AppType)),
    permissions: valibotSchemas.appPermissions(),
    stateDefinition: appStateDefinition(),
    name: v.string(),
    targetCollectionIds: v.array(collectionId()),
    files: v.strictObject({
      "/main.tsx": typescriptModule(),
    }),
  });
}

export function protoAppDefinition(): v.GenericSchema<
  unknown,
  AppDefinition<true>
> {
  return v.strictObject({
    type: v.picklist(Object.values(AppType)),
    permissions: valibotSchemas.appPermissions(),
    stateDefinition: appStateDefinition(),
    name: v.string(),
    targetCollectionIds: v.array(
      v.union([protoCollectionId(), collectionId()]),
    ),
    files: v.strictObject({
      "/main.tsx": typescriptModule(),
    }),
  });
}

export function appStateDefinition() {
  return v.strictObject({
    schema: schemaShape() as unknown as v.GenericSchema<unknown, Schema>,
    initialState: v.any(),
    migration: v.nullable(typescriptModule()),
  });
}

export function appState() {
  return v.strictObject({
    content: v.any(),
    revision: v.pipe(v.number(), v.safeInteger(), v.minValue(1)),
  });
}

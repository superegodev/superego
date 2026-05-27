import {
  type App,
  type AppDefinition,
  AppType,
  type AppVersion,
} from "@superego/backend";
import * as v from "valibot";
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
    id: appVersionId(),
    targetCollections: v.array(
      v.strictObject({
        id: collectionId(),
        versionId: collectionVersionId(),
      }),
    ),
    files: v.strictObject({
      "/main.tsx": typescriptModule(),
      "/main.js": v.string(),
    }),
    createdAt: v.date(),
  });
}

export function app(): v.GenericSchema<unknown, App> {
  return v.strictObject({
    id: appId(),
    type: v.picklist(Object.values(AppType)),
    name: v.string(),
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
    name: v.string(),
    targetCollectionIds: v.array(
      v.union([protoCollectionId(), collectionId()]),
    ),
    files: v.strictObject({
      "/main.tsx": typescriptModule(),
    }),
  });
}

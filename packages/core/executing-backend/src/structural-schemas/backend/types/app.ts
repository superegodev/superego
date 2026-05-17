import {
  type App,
  type AppDefinition,
  type AppVersionFile,
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

export function appVersionEntrypoint(): v.GenericSchema<
  unknown,
  AppVersion["entrypoint"]
> {
  return v.literal("/dist/index.html");
}

export function appVersionFile(): v.GenericSchema<unknown, AppVersionFile> {
  return v.strictObject({
    role: v.picklist(["source", "build", "generated", "config"]),
    mimeType: v.string(),
    content: v.union([
      v.string(),
      v.instance(Uint8Array) as v.GenericSchema<
        unknown,
        Uint8Array<ArrayBuffer>
      >,
    ]),
  });
}

export function appVersionFiles(): v.GenericSchema<
  unknown,
  AppVersion["files"]
> {
  return v.record(
    v.pipe(v.string(), v.regex(/^\/[^/].*$/)) as any,
    appVersionFile(),
  );
}

export function appVersion(): v.GenericSchema<unknown, AppVersion> {
  return v.strictObject({
    id: appVersionId(),
    targetCollections: v.array(
      v.strictObject({
        id: collectionId(),
        versionId: collectionVersionId(),
      }),
    ),
    entrypoint: appVersionEntrypoint(),
    files: appVersionFiles(),
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
    targetCollections: v.array(
      v.strictObject({
        id: collectionId(),
        versionId: collectionVersionId(),
      }),
    ),
    entrypoint: appVersionEntrypoint(),
    files: appVersionFiles(),
  });
}

export function protoAppDefinition(): v.GenericSchema<
  unknown,
  AppDefinition<true>
> {
  return v.strictObject({
    type: v.picklist(Object.values(AppType)),
    name: v.string(),
    targetCollections: v.array(
      v.strictObject({
        id: v.union([protoCollectionId(), collectionId()]),
        versionId: v.nullable(collectionVersionId()),
      }),
    ),
    entrypoint: appVersionEntrypoint(),
    files: appVersionFiles(),
  });
}

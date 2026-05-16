import {
  type LitePack,
  type LitePackInfo,
  type Pack,
  type PackInfo,
  Theme,
} from "@superego/backend";
import * as v from "valibot";
import { packId } from "../ids.js";
import { protoAppDefinition } from "./app.js";
import { protoCollectionDefinition } from "./collection.js";
import { protoCollectionCategoryDefinition } from "./collectionCategory.js";
import { protoDocumentDefinition } from "./document.js";

const screenshot = () =>
  v.looseObject({
    theme: v.picklist([Theme.Light, Theme.Dark]),
    mimeType: v.pipe(v.string(), v.regex(/^image\/.+$/)) as v.GenericSchema<
      unknown,
      `image/${string}`
    >,
    content: v.instance(Uint8Array) as v.GenericSchema<
      unknown,
      Uint8Array<ArrayBuffer>
    >,
  });

export function packInfo(): v.GenericSchema<unknown, PackInfo> {
  return v.looseObject({
    name: v.string(),
    shortDescription: v.string(),
    longDescription: v.string(),
    screenshots: v.array(screenshot()),
  });
}

export function litePackInfo(): v.GenericSchema<unknown, LitePackInfo> {
  return v.looseObject({
    name: v.string(),
    shortDescription: v.string(),
    screenshots: v.array(screenshot()),
  });
}

export function pack(): v.GenericSchema<unknown, Pack> {
  return v.looseObject({
    id: packId(),
    info: packInfo(),
    collectionCategories: v.array(protoCollectionCategoryDefinition()),
    collections: v.array(protoCollectionDefinition()),
    apps: v.array(protoAppDefinition()),
    documents: v.array(protoDocumentDefinition()),
  }) as unknown as v.GenericSchema<unknown, Pack>;
}

export function litePack(): v.GenericSchema<unknown, LitePack> {
  return v.looseObject({
    id: packId(),
    info: litePackInfo(),
  });
}

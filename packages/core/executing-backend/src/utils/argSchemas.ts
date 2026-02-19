import type {
  AppDefinition,
  AudioContent,
  CollectionCategoryDefinition,
  CollectionDefinition,
  CollectionSettings,
  CollectionVersionSettings,
  ConnectorAuthenticationSettings,
  DocumentDefinition,
  GlobalSettings,
  MessageContentPart,
  NonEmptyArray,
  Pack,
  RemoteConverters,
  TypescriptModule,
} from "@superego/backend";
import type { Schema } from "@superego/schema";
import { valibotSchemas } from "@superego/shared-utils";
import * as v from "valibot";

export function typescriptModule(): v.GenericSchema<TypescriptModule> {
  return v.strictObject({
    source: v.string(),
    compiled: v.string(),
  });
}

export function remoteConverters(): v.GenericSchema<RemoteConverters> {
  return v.strictObject({
    fromRemoteDocument: typescriptModule(),
  });
}

export function audioContent(): v.GenericSchema<AudioContent> {
  return v.strictObject({
    content: v.instance(Uint8Array),
    contentType: v.string(),
  });
}

export function appVersionFiles(): v.GenericSchema<{
  "/main.tsx": TypescriptModule;
}> {
  return v.strictObject({
    "/main.tsx": typescriptModule(),
  });
}

export function appDefinition(): v.GenericSchema<AppDefinition> {
  return v.strictObject({
    type: v.string() as v.GenericSchema<AppDefinition["type"]>,
    name: v.string(),
    targetCollectionIds: v.array(valibotSchemas.id.collection()),
    files: appVersionFiles(),
  });
}

export function collectionCategoryDefinition(): v.GenericSchema<CollectionCategoryDefinition> {
  return v.strictObject({
    name: v.string(),
    icon: v.nullable(v.string()),
    parentId: v.nullable(valibotSchemas.id.collectionCategory()),
  });
}

export function schema(): v.GenericSchema<Schema> {
  return v.looseObject({
    types: v.record(v.string(), v.any()),
    rootType: v.string(),
  }) as unknown as v.GenericSchema<Schema>;
}

export function collectionVersionSettings(): v.GenericSchema<CollectionVersionSettings> {
  return v.strictObject({
    contentBlockingKeysGetter: v.nullable(typescriptModule()),
    contentSummaryGetter: typescriptModule(),
    defaultDocumentViewUiOptions: v.nullable(v.any()),
  }) as unknown as v.GenericSchema<CollectionVersionSettings>;
}

export function collectionSettings(): v.GenericSchema<CollectionSettings> {
  return v.strictObject({
    name: v.string(),
    icon: v.nullable(v.string()),
    collectionCategoryId: v.nullable(valibotSchemas.id.collectionCategory()),
    defaultCollectionViewAppId: v.nullable(valibotSchemas.id.app()),
    description: v.nullable(v.string()),
    assistantInstructions: v.nullable(v.string()),
  });
}

export function collectionDefinition(): v.GenericSchema<CollectionDefinition> {
  return v.strictObject({
    settings: collectionSettings(),
    schema: schema(),
    versionSettings: collectionVersionSettings(),
  });
}

export function documentDefinition(): v.GenericSchema<DocumentDefinition> {
  return v.strictObject({
    collectionId: valibotSchemas.id.collection(),
    content: v.any(),
    options: v.optional(
      v.strictObject({
        skipDuplicateCheck: v.boolean(),
      }),
    ),
  }) as unknown as v.GenericSchema<DocumentDefinition>;
}

export function connectorAuthenticationSettings(): v.GenericSchema<ConnectorAuthenticationSettings> {
  return v.looseObject({}) as unknown as v.GenericSchema<ConnectorAuthenticationSettings>;
}

export function messageContentPart(): v.GenericSchema<MessageContentPart> {
  return v.looseObject({
    type: v.string(),
  }) as unknown as v.GenericSchema<MessageContentPart>;
}

export function messageContentPartText(): v.GenericSchema<MessageContentPart.Text> {
  return v.looseObject({
    type: v.string(),
    text: v.string(),
  }) as unknown as v.GenericSchema<MessageContentPart.Text>;
}

export function nonEmptyArray<T>(
  item: v.GenericSchema<T>,
): v.GenericSchema<NonEmptyArray<T>> {
  return v.pipe(v.array(item), v.minLength(1)) as unknown as v.GenericSchema<
    NonEmptyArray<T>
  >;
}

export function globalSettings(): v.GenericSchema<GlobalSettings> {
  return v.strictObject({
    inference: v.looseObject({
      chatCompletions: v.looseObject({
        provider: v.looseObject({
          baseUrl: v.nullable(v.string()),
          apiKey: v.nullable(v.string()),
        }),
        model: v.nullable(v.string()),
      }),
      transcriptions: v.looseObject({
        provider: v.looseObject({
          baseUrl: v.nullable(v.string()),
          apiKey: v.nullable(v.string()),
        }),
        model: v.nullable(v.string()),
      }),
      speech: v.looseObject({
        provider: v.looseObject({
          baseUrl: v.nullable(v.string()),
          apiKey: v.nullable(v.string()),
        }),
        model: v.nullable(v.string()),
        voice: v.nullable(v.string()),
      }),
      fileInspection: v.looseObject({
        provider: v.looseObject({
          baseUrl: v.nullable(v.string()),
          apiKey: v.nullable(v.string()),
        }),
        model: v.nullable(v.string()),
      }),
    }),
    assistants: v.looseObject({
      userName: v.nullable(v.string()),
      developerPrompts: v.looseObject({}),
    }),
    appearance: v.looseObject({
      theme: v.string(),
    }),
  }) as unknown as v.GenericSchema<GlobalSettings>;
}

export function pack(): v.GenericSchema<Pack> {
  return v.strictObject({
    id: valibotSchemas.id.pack(),
    info: v.looseObject({
      name: v.string(),
      shortDescription: v.string(),
      longDescription: v.string(),
      screenshots: v.array(
        v.strictObject({
          mimeType: v.string() as v.GenericSchema<`image/${string}`>,
          content: v.instance(Uint8Array),
        }),
      ),
    }),
    collectionCategories: v.array(
      v.strictObject({
        name: v.string(),
        icon: v.nullable(v.string()),
        parentId: v.nullable(v.string()),
      }),
    ),
    collections: v.array(
      v.strictObject({
        settings: v.strictObject({
          name: v.string(),
          icon: v.nullable(v.string()),
          collectionCategoryId: v.nullable(v.string()),
          defaultCollectionViewAppId: v.nullable(v.string()),
          description: v.nullable(v.string()),
          assistantInstructions: v.nullable(v.string()),
        }),
        schema: schema(),
        versionSettings: collectionVersionSettings(),
      }),
    ),
    apps: v.array(
      v.strictObject({
        type: v.string(),
        name: v.string(),
        targetCollectionIds: v.array(v.string()),
        files: appVersionFiles(),
      }),
    ),
    documents: v.array(
      v.strictObject({
        collectionId: v.string(),
        content: v.any(),
        options: v.optional(
          v.strictObject({
            skipDuplicateCheck: v.boolean(),
          }),
        ),
      }),
    ),
  }) as unknown as v.GenericSchema<Pack>;
}

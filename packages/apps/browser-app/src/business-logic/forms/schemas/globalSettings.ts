import { AssistantName, type GlobalSettings, Theme } from "@superego/backend";
import * as v from "valibot";

export default function globalSettings(): v.GenericSchema<
  GlobalSettings,
  GlobalSettings
> {
  return v.strictObject({
    appearance: v.strictObject({
      theme: v.picklist(Object.values(Theme)),
    }),
    inference: v.strictObject({
      completions: v.strictObject({
        model: v.nullable(v.string()),
        provider: v.strictObject({
          baseUrl: v.nullable(v.string()),
          apiKey: v.nullable(v.string()),
        }),
      }),
      transcriptions: v.strictObject({
        model: v.nullable(v.string()),
        provider: v.strictObject({
          baseUrl: v.nullable(v.string()),
          apiKey: v.nullable(v.string()),
        }),
      }),
      speech: v.strictObject({
        model: v.nullable(v.string()),
        voice: v.nullable(v.string()),
        provider: v.strictObject({
          baseUrl: v.nullable(v.string()),
          apiKey: v.nullable(v.string()),
        }),
      }),
    }),
    assistants: v.strictObject({
      userName: v.nullable(v.string()),
      developerPrompts: v.strictObject({
        [AssistantName.CollectionCreator]: v.nullable(v.string()),
        [AssistantName.Factotum]: v.nullable(v.string()),
      }),
    }),
  });
}

import {
  AICompletionModel,
  type GlobalSettings,
  Theme,
} from "@superego/backend";
import * as v from "valibot";

export default function globalSettings(): v.GenericSchema<
  GlobalSettings,
  GlobalSettings
> {
  return v.strictObject({
    appearance: v.strictObject({
      theme: v.picklist(Object.values(Theme)),
    }),
    aiAssistant: v.strictObject({
      providers: v.strictObject({
        groq: v.strictObject({
          apiKey: v.nullable(v.string()),
          baseUrl: v.nullable(v.string()),
        }),
      }),
      completions: v.strictObject({
        defaultModel: v.picklist(Object.values(AICompletionModel)),
      }),
    }),
  });
}

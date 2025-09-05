import { CompletionModel, type GlobalSettings, Theme } from "@superego/backend";
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
      providers: v.strictObject({
        groq: v.strictObject({
          apiKey: v.nullable(v.string()),
        }),
        openai: v.strictObject({
          apiKey: v.nullable(v.string()),
        }),
        google: v.strictObject({
          apiKey: v.nullable(v.string()),
        }),
        openrouter: v.strictObject({
          apiKey: v.nullable(v.string()),
        }),
      }),
      completions: v.strictObject({
        model: v.picklist(Object.values(CompletionModel)),
      }),
    }),
  });
}

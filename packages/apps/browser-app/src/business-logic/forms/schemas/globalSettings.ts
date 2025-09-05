import { type GlobalSettings, Theme } from "@superego/backend";
import * as v from "valibot";

export default function globalSettings(): v.GenericSchema<
  GlobalSettings,
  GlobalSettings
> {
  return v.strictObject({
    appearance: v.strictObject({
      theme: v.picklist(Object.values(Theme)),
    }),
    assistant: v.strictObject({
      completions: v.strictObject({
        model: v.nullable(v.string()),
        provider: v.strictObject({
          baseUrl: v.nullable(v.string()),
          apiKey: v.nullable(v.string()),
        }),
      }),
      developerPrompt: v.nullable(v.string()),
    }),
  });
}

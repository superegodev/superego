import { AssistantName, type GlobalSettings, Theme } from "@superego/backend";
import * as v from "valibot";
import { inferenceOptions, inferenceProvider } from "./inference.js";

export function globalSettings(): v.GenericSchema<unknown, GlobalSettings> {
  return v.strictObject({
    appearance: v.strictObject({
      theme: v.picklist(Object.values(Theme)),
    }),
    inference: v.strictObject({
      providers: v.array(inferenceProvider()),
      defaultInferenceOptions: inferenceOptions(),
    }),
    assistants: v.strictObject({
      userInfo: v.nullable(v.string()),
      userPreferences: v.nullable(v.string()),
      developerPrompts: v.strictObject({
        [AssistantName.CollectionCreator]: v.nullable(v.string()),
        [AssistantName.Factotum]: v.nullable(v.string()),
      }),
    }),
  });
}

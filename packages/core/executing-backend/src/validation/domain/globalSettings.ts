import { AssistantName, type GlobalSettings, Theme } from "@superego/backend";
import * as v from "valibot";
import { inferenceOptions, inferenceProvider } from "./inference.js";

export function globalSettings(): v.GenericSchema<unknown, GlobalSettings> {
  return v.looseObject({
    appearance: v.looseObject({
      theme: v.picklist(Object.values(Theme)),
    }),
    inference: v.looseObject({
      providers: v.array(inferenceProvider()),
      defaultInferenceOptions: inferenceOptions(),
    }),
    assistants: v.looseObject({
      userInfo: v.nullable(v.string()),
      userPreferences: v.nullable(v.string()),
      developerPrompts: v.looseObject({
        [AssistantName.CollectionCreator]: v.nullable(v.string()),
        [AssistantName.Factotum]: v.nullable(v.string()),
      }),
    }),
  });
}

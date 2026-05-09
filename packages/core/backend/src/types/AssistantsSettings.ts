import * as v from "valibot";
import AssistantName from "../enums/AssistantName.js";

const AssistantsSettingsSchema = v.object({
  userInfo: v.nullable(v.string()),
  userPreferences: v.nullable(v.string()),
  developerPrompts: v.object({
    [AssistantName.CollectionCreator]: v.nullable(v.string()),
    [AssistantName.Factotum]: v.nullable(v.string()),
  }),
});
export default AssistantsSettingsSchema;
export type AssistantsSettings = v.InferOutput<typeof AssistantsSettingsSchema>;

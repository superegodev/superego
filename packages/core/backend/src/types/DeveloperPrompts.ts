import * as v from "valibot";
import AssistantName from "../enums/AssistantName.js";

const DeveloperPromptsSchema = v.object({
  [AssistantName.CollectionCreator]: v.string(),
  [AssistantName.Factotum]: v.string(),
}) as v.GenericSchema<{ [K in AssistantName]: string }>;
export default DeveloperPromptsSchema;
export type DeveloperPrompts = v.InferOutput<typeof DeveloperPromptsSchema>;

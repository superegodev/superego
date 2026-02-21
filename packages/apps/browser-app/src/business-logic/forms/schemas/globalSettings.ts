import {
  AssistantName,
  type GlobalSettings,
  type InferenceModelId,
  Theme,
} from "@superego/backend";
import * as v from "valibot";

// TODO_AI:
// - move this (and the whole inference?) to shared-utils validation schemas
// - non-structural validation should be done in the usecase
const inferenceModelId = () =>
  v.custom<InferenceModelId>(
    (value) => typeof value === "string" && value.includes("@"),
  );

export default function globalSettings(): v.GenericSchema<
  GlobalSettings,
  GlobalSettings
> {
  return v.strictObject({
    appearance: v.strictObject({
      theme: v.picklist(Object.values(Theme)),
    }),
    inference: v.strictObject({
      providers: v.array(
        v.strictObject({
          name: v.string(),
          baseUrl: v.string(),
          apiKey: v.nullable(v.string()),
        }),
      ),
      models: v.array(
        v.strictObject({
          id: inferenceModelId(),
          name: v.string(),
          providerName: v.string(),
          capabilities: v.strictObject({
            reasoning: v.boolean(),
            audioUnderstanding: v.boolean(),
            imageUnderstanding: v.boolean(),
            pdfUnderstanding: v.boolean(),
            webSearching: v.boolean(),
          }),
        }),
      ),
      defaultChatModel: v.nullable(inferenceModelId()),
      defaultTranscriptionModel: v.nullable(inferenceModelId()),
      defaultFileInspectionModel: v.nullable(inferenceModelId()),
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

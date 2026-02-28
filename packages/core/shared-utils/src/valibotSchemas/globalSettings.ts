import {
  AssistantName,
  type GlobalSettings,
  InferenceProviderDriver,
  Theme,
} from "@superego/backend";
import * as v from "valibot";
import validateInferenceOptions from "../validators/validateInferenceOptions.js";

const inferenceModelRef = () =>
  v.strictObject({
    providerName: v.string(),
    modelId: v.string(),
  });

export default function globalSettings(): v.GenericSchema<
  GlobalSettings,
  GlobalSettings
> {
  return v.pipe(
    v.strictObject({
      appearance: v.strictObject({
        theme: v.picklist(Object.values(Theme)),
      }),
      inference: v.strictObject({
        providers: v.array(
          v.strictObject({
            name: v.string(),
            baseUrl: v.string(),
            apiKey: v.nullable(v.string()),
            driver: v.picklist(Object.values(InferenceProviderDriver)),
            models: v.array(
              v.strictObject({
                id: v.string(),
                name: v.string(),
                capabilities: v.strictObject({
                  reasoning: v.boolean(),
                  audioUnderstanding: v.boolean(),
                  imageUnderstanding: v.boolean(),
                  pdfUnderstanding: v.boolean(),
                  webSearching: v.boolean(),
                }),
              }),
            ),
          }),
        ),
        defaultInferenceOptions: v.strictObject({
          completion: v.nullable(
            v.strictObject({ providerModelRef: inferenceModelRef() }),
          ),
          transcription: v.nullable(
            v.strictObject({ providerModelRef: inferenceModelRef() }),
          ),
          fileInspection: v.nullable(
            v.strictObject({ providerModelRef: inferenceModelRef() }),
          ),
        }),
      }),
      assistants: v.strictObject({
        userName: v.nullable(v.string()),
        developerPrompts: v.strictObject({
          [AssistantName.CollectionCreator]: v.nullable(v.string()),
          [AssistantName.Factotum]: v.nullable(v.string()),
        }),
      }),
    }),
    v.rawCheck(({ dataset, addIssue }) => {
      if (!dataset.typed) {
        return;
      }
      const inferenceOptionsIssues = validateInferenceOptions(
        dataset.value.inference.defaultInferenceOptions,
        dataset.value.inference,
      );
      for (const issue of inferenceOptionsIssues) {
        const path = [
          { input: dataset.value, key: "inference" },
          {
            input: dataset.value.inference,
            key: "defaultInferenceOptions",
          },
          ...(issue.path?.map((segment) => ({
            input: dataset.value.inference.defaultInferenceOptions,
            key: segment.key,
          })) ?? []),
        ];
        addIssue({
          message: issue.message,
          path: path as [v.IssuePathItem, ...v.IssuePathItem[]],
        });
      }
    }),
  );
}

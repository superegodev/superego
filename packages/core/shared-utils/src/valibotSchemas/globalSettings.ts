import {
  AssistantName,
  type GlobalSettings,
  InferenceProviderDriver,
  ReasoningEffort,
  Theme,
} from "@superego/backend";
import * as v from "valibot";
import validateInferenceOptions from "../validators/validateInferenceOptions.js";

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
                  audioUnderstanding: v.boolean(),
                  imageUnderstanding: v.boolean(),
                  pdfUnderstanding: v.boolean(),
                }),
              }),
            ),
          }),
        ),
        defaultInferenceOptions: v.strictObject({
          completion: v.nullable(
            v.strictObject({
              providerModelRef: inferenceModelRef(),
              reasoningEffort: v.picklist(Object.values(ReasoningEffort)),
            }),
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
        userInfo: v.nullable(v.string()),
        userPreferences: v.nullable(v.string()),
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
        addIssue({
          message: issue.message,
          path: makeIssuePath(dataset.value, issue.path ?? []),
        });
      }
    }),
  );
}

const inferenceModelRef = () =>
  v.strictObject({
    providerName: v.string(),
    modelId: v.string(),
  });

function makeIssuePath(
  root: GlobalSettings,
  segments: { key: string | number }[],
): [v.IssuePathItem, ...v.IssuePathItem[]] {
  // Populate each segment with the correct input value.
  let currentInput: unknown = root.inference.defaultInferenceOptions;
  const issuePathSegments = segments.map((segment) => {
    const pathSegment = { input: currentInput, key: segment.key };
    currentInput = (currentInput as Record<string, unknown>)?.[segment.key];
    return pathSegment;
  });

  return [
    { input: root, key: "inference" },
    { input: root.inference, key: "defaultInferenceOptions" },
    ...issuePathSegments,
  ] as unknown as [v.IssuePathItem, ...v.IssuePathItem[]];
}

import {
  type InferenceModel,
  type InferenceOptions,
  type InferenceProvider,
  InferenceProviderDriver,
  type InferenceProviderModelRef,
  ReasoningEffort,
} from "@superego/backend";
import * as v from "valibot";

export function inferenceProviderModelRef(): v.GenericSchema<
  unknown,
  InferenceProviderModelRef
> {
  return v.strictObject({
    providerName: v.string(),
    modelId: v.string(),
  });
}

export function inferenceModel(): v.GenericSchema<unknown, InferenceModel> {
  return v.strictObject({
    id: v.string(),
    name: v.string(),
    capabilities: v.strictObject({
      audioUnderstanding: v.boolean(),
      imageUnderstanding: v.boolean(),
      pdfUnderstanding: v.boolean(),
    }),
  });
}

export function inferenceProvider(): v.GenericSchema<
  unknown,
  InferenceProvider
> {
  return v.strictObject({
    name: v.string(),
    baseUrl: v.string(),
    apiKey: v.nullable(v.string()),
    driver: v.picklist(Object.values(InferenceProviderDriver)),
    models: v.array(inferenceModel()),
  });
}

const completionOptions = () =>
  v.strictObject({
    providerModelRef: inferenceProviderModelRef(),
    reasoningEffort: v.picklist(Object.values(ReasoningEffort)),
  });

const transcriptionOptions = () =>
  v.strictObject({
    providerModelRef: inferenceProviderModelRef(),
  });

const fileInspectionOptions = () =>
  v.strictObject({
    providerModelRef: inferenceProviderModelRef(),
  });

/**
 * Schema for `InferenceOptions<Prop>`. The optional type parameter `Prop`
 * specifies which capability is non-nullable. When `Prop` is omitted, every
 * field is nullable.
 */
export function inferenceOptions<
  Prop extends "completion" | "transcription" | "fileInspection" = never,
>(nonNullableProp?: Prop): v.GenericSchema<unknown, InferenceOptions<Prop>> {
  return v.strictObject({
    completion:
      nonNullableProp === "completion"
        ? completionOptions()
        : v.nullable(completionOptions()),
    transcription:
      nonNullableProp === "transcription"
        ? transcriptionOptions()
        : v.nullable(transcriptionOptions()),
    fileInspection:
      nonNullableProp === "fileInspection"
        ? fileInspectionOptions()
        : v.nullable(fileInspectionOptions()),
  }) as unknown as v.GenericSchema<unknown, InferenceOptions<Prop>>;
}

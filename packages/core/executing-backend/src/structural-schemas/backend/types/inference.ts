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
  return v.looseObject({
    providerName: v.string(),
    modelId: v.string(),
  });
}

export function inferenceModel(): v.GenericSchema<unknown, InferenceModel> {
  return v.looseObject({
    id: v.string(),
    name: v.string(),
    capabilities: v.looseObject({
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
  return v.looseObject({
    name: v.string(),
    baseUrl: v.string(),
    apiKey: v.nullable(v.string()),
    driver: v.picklist(Object.values(InferenceProviderDriver)),
    models: v.array(inferenceModel()),
  });
}

const completionOptions = () =>
  v.looseObject({
    providerModelRef: inferenceProviderModelRef(),
    reasoningEffort: v.picklist(Object.values(ReasoningEffort)),
  });

const transcriptionOptions = () =>
  v.looseObject({
    providerModelRef: inferenceProviderModelRef(),
  });

const fileInspectionOptions = () =>
  v.looseObject({
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
  return v.looseObject({
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

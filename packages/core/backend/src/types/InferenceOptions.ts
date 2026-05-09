import * as v from "valibot";
import { ReasoningEffortSchema } from "../enums/ReasoningEffort.js";
import InferenceProviderModelRefSchema from "./InferenceProviderModelRef.js";

const completionSchema = v.object({
  providerModelRef: InferenceProviderModelRefSchema,
  reasoningEffort: ReasoningEffortSchema,
});
const transcriptionSchema = v.object({
  providerModelRef: InferenceProviderModelRefSchema,
});
const fileInspectionSchema = v.object({
  providerModelRef: InferenceProviderModelRefSchema,
});

/**
 * Inference options for each capability — every property nullable. Use the
 * `*Completion` / `*Transcription` variants when a specific capability must
 * be present.
 */
const InferenceOptionsSchema = v.object({
  completion: v.nullable(completionSchema),
  transcription: v.nullable(transcriptionSchema),
  fileInspection: v.nullable(fileInspectionSchema),
});
export default InferenceOptionsSchema;
export type InferenceOptions = v.InferOutput<typeof InferenceOptionsSchema>;

/** Variant guaranteeing that `completion` is non-null. */
export const InferenceOptionsCompletionSchema = v.object({
  completion: completionSchema,
  transcription: v.nullable(transcriptionSchema),
  fileInspection: v.nullable(fileInspectionSchema),
});
export type InferenceOptionsCompletion = v.InferOutput<
  typeof InferenceOptionsCompletionSchema
>;

/** Variant guaranteeing that `transcription` is non-null. */
export const InferenceOptionsTranscriptionSchema = v.object({
  completion: v.nullable(completionSchema),
  transcription: transcriptionSchema,
  fileInspection: v.nullable(fileInspectionSchema),
});
export type InferenceOptionsTranscription = v.InferOutput<
  typeof InferenceOptionsTranscriptionSchema
>;

/** Variant guaranteeing that `fileInspection` is non-null. */
export const InferenceOptionsFileInspectionSchema = v.object({
  completion: v.nullable(completionSchema),
  transcription: v.nullable(transcriptionSchema),
  fileInspection: fileInspectionSchema,
});
export type InferenceOptionsFileInspection = v.InferOutput<
  typeof InferenceOptionsFileInspectionSchema
>;

/**
 * Helper type to narrow `InferenceOptions` when one or more capabilities are
 * known to be non-null. Used by `inferenceOptionsHas` /
 * `assertInferenceOptionsHas` in @superego/shared-utils.
 */
export type InferenceOptionsHaving<Capability extends keyof InferenceOptions> =
  {
    [K in keyof InferenceOptions]: K extends Capability
      ? NonNullable<InferenceOptions[K]>
      : InferenceOptions[K];
  };

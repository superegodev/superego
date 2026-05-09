import * as v from "valibot";
import ArgumentsNotValidSchema from "../../errors/ArgumentsNotValid.js";
import InferenceOptionsNotValidSchema from "../../errors/InferenceOptionsNotValid.js";
import TooManyFailedImplementationAttemptsSchema from "../../errors/TooManyFailedImplementationAttempts.js";
import UnexpectedErrorSchema from "../../errors/UnexpectedError.js";
import WriteTypescriptModuleToolNotCalledSchema from "../../errors/WriteTypescriptModuleToolNotCalled.js";
import AudioContentSchema from "../../types/AudioContent.js";
import {
  InferenceOptionsCompletionSchema,
  InferenceOptionsTranscriptionSchema,
} from "../../types/InferenceOptions.js";
import TypescriptFileSchema from "../../types/TypescriptFile.js";
import TypescriptModuleSchema from "../../types/TypescriptModule.js";

export const inferenceContracts = {
  stt: {
    argumentsSchema: v.tuple([
      AudioContentSchema,
      InferenceOptionsTranscriptionSchema,
    ]),
    dataSchema: v.string(),
    errorSchemas: [
      ArgumentsNotValidSchema,
      InferenceOptionsNotValidSchema,
      UnexpectedErrorSchema,
    ],
  },
  implementTypescriptModule: {
    argumentsSchema: v.tuple([
      v.object({
        description: v.string(),
        rules: v.nullable(v.string()),
        additionalInstructions: v.nullable(v.string()),
        template: v.string(),
        libs: v.array(TypescriptFileSchema),
        startingPoint: TypescriptFileSchema,
        userRequest: v.string(),
      }),
      InferenceOptionsCompletionSchema,
    ]),
    dataSchema: TypescriptModuleSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      InferenceOptionsNotValidSchema,
      WriteTypescriptModuleToolNotCalledSchema,
      TooManyFailedImplementationAttemptsSchema,
      UnexpectedErrorSchema,
    ],
  },
} as const;

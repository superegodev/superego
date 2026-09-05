import type { Backend, InferenceOptions } from "@superego/backend";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import GenerateTypescriptModule from "./GenerateTypescriptModule.js";

export default class InferenceImplementApp extends BackendUsecase<
  Backend["inference"]["implementApp"]
> {
  argumentsSchema = v.tuple([
    v.strictObject({
      spec: v.string(),
      description: v.string(),
      rules: v.nullable(v.string()),
      additionalInstructions: v.nullable(v.string()),
      template: v.string(),
      libs: v.array(structuralSchemas.backend.types.typescriptFile()),
      startingPoint: structuralSchemas.backend.types.typescriptFile(),
      userRequest: v.string(),
    }),
    structuralSchemas.backend.types.inferenceOptions("completion"),
  ]);
  resultSchema = structuralSchemas.global.result(
    v.strictObject({
      files: v.strictObject({
        "/main.tsx": structuralSchemas.backend.types.typescriptModule(),
      }),
      spec: v.string(),
    }),
    [
      structuralSchemas.backend.errors.inferenceOptionsNotValid(),
      structuralSchemas.backend.errors.tooManyFailedImplementationAttempts(),
      structuralSchemas.backend.errors.unexpectedError(),
      structuralSchemas.backend.errors.writeTypescriptModuleToolNotCalled(),
    ],
  );

  async exec(
    request: Parameters<Backend["inference"]["implementApp"]>[0],
    inferenceOptions: InferenceOptions<"completion">,
  ) {
    const result = await this.sub(GenerateTypescriptModule).exec(
      request,
      inferenceOptions,
    );
    return result.success
      ? makeSuccessfulResult({
          files: { "/main.tsx": result.data.module },
          spec: result.data.spec,
        })
      : result;
  }
}

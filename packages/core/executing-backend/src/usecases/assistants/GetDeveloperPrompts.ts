import {
  AssistantName,
  type Backend,
  type DeveloperPrompts,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import CollectionCreatorAssistant from "../../assistants/CollectionCreatorAssistant/CollectionCreatorAssistant.js";
import FactotumAssistant from "../../assistants/FactotumAssistant/FactotumAssistant.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class AssistantsGetDeveloperPrompts extends BackendUsecase<
  Backend["assistants"]["getDeveloperPrompts"]
> {
  argumentsSchema = v.tuple([]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.developerPrompts(),
    [structuralSchemas.backend.errors.unexpectedError()],
  );

  async exec(): ResultPromise<DeveloperPrompts, UnexpectedError> {
    return makeSuccessfulResult({
      [AssistantName.CollectionCreator]:
        CollectionCreatorAssistant.getDefaultDeveloperPrompt(),
      [AssistantName.Factotum]: FactotumAssistant.getDefaultDeveloperPrompt(),
    });
  }
}

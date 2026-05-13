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
import BackendUsecase from "../../utils/BackendUsecase.js";
import { developerPrompts } from "../../validation/domain/conversation.js";
import { unexpectedError } from "../../validation/errors.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class AssistantsGetDeveloperPrompts extends BackendUsecase<
  Backend["assistants"]["getDeveloperPrompts"]
> {
  argumentsSchema = v.tuple([]);
  resultSchema = makeResultSchema(developerPrompts(), [unexpectedError()]);

  async exec(): ResultPromise<DeveloperPrompts, UnexpectedError> {
    return makeSuccessfulResult({
      [AssistantName.CollectionCreator]:
        CollectionCreatorAssistant.getDefaultDeveloperPrompt(),
      [AssistantName.Factotum]: FactotumAssistant.getDefaultDeveloperPrompt(),
    });
  }
}

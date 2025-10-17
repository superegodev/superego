import {
  AssistantName,
  type Backend,
  type DeveloperPrompts,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import CollectionCreatorAssistant from "../../assistants/CollectionCreatorAssistant/CollectionCreatorAssistant.js";
import FactotumAssistant from "../../assistants/FactotumAssistant/FactotumAssistant.js";
import Usecase from "../../utils/Usecase.js";

export default class AssistantsGetDeveloperPrompts extends Usecase<
  Backend["assistants"]["getDeveloperPrompts"]
> {
  async exec(): ResultPromise<DeveloperPrompts, UnexpectedError> {
    return makeSuccessfulResult({
      [AssistantName.CollectionCreator]:
        CollectionCreatorAssistant.getDefaultDeveloperPrompt(),
      [AssistantName.Factotum]: FactotumAssistant.getDefaultDeveloperPrompt(),
    });
  }
}

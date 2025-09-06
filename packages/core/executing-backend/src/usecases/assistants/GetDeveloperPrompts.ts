import {
  AssistantName,
  type Backend,
  type DeveloperPrompts,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import CollectionManagerAssistant from "../../assistants/CollectionManagerAssistant/CollectionManagerAssistant.js";
import FactotumAssistant from "../../assistants/FactotumAssistant/FactotumAssistant.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import Usecase from "../../utils/Usecase.js";

export default class AssistantsGetDeveloperPrompts extends Usecase<
  Backend["assistants"]["getDeveloperPrompts"]
> {
  async exec(): ResultPromise<DeveloperPrompts, UnexpectedError> {
    return makeSuccessfulResult({
      [AssistantName.CollectionManager]:
        CollectionManagerAssistant.getDefaultDeveloperPrompt(),
      [AssistantName.Factotum]: FactotumAssistant.getDefaultDeveloperPrompt(),
    });
  }
}

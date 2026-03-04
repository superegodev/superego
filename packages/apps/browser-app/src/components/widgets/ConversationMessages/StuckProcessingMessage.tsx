import {
  type Conversation,
  MessageRole,
  ReasoningEffort,
} from "@superego/backend";
import { PiArrowCounterClockwiseBold } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { useRecoverConversation } from "../../../business-logic/backend/hooks.js";
import useDefaultInferenceOptions from "../../../business-logic/inference/useDefaultInferenceOptions.js";
import isEmpty from "../../../utils/isEmpty.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import * as cs from "./ConversationMessages.css.js";
import ModelActionMenu from "./ModelActionMenu/ModelActionMenu.js";
import makeModelActionMenuItems from "./ModelActionMenu/makeModelActionMenuItems.js";

interface Props {
  conversation: Conversation;
  onRecoverStarted: () => void;
}
export default function StuckProcessingMessage({
  conversation,
  onRecoverStarted,
}: Props) {
  const intl = useIntl();

  const { globalSettings } = useGlobalData();
  const defaultInferenceOptions = useDefaultInferenceOptions();
  const { mutate } = useRecoverConversation();

  const lastAssistantMessage = conversation.messages.findLast(
    (message) => message.role === MessageRole.Assistant,
  );
  const models = makeModelActionMenuItems(
    globalSettings.inference.providers,
    lastAssistantMessage?.inferenceOptions.completion.providerModelRef ?? null,
  );

  return (
    <div className={cs.ErrorMessage.root}>
      <div className={cs.ErrorMessage.message}>
        <FormattedMessage defaultMessage="The assistant seems to be taking too long." />
        {!isEmpty(models) ? (
          <ModelActionMenu
            trigger={
              <IconButton
                variant="invisible"
                label={intl.formatMessage({ defaultMessage: "Retry" })}
                className={cs.ErrorMessage.retryButton}
              >
                <PiArrowCounterClockwiseBold />
              </IconButton>
            }
            models={models}
            onModelAction={async (providerModelRef) => {
              onRecoverStarted();
              await mutate(conversation.id, {
                completion: {
                  providerModelRef,
                  reasoningEffort:
                    defaultInferenceOptions.completion?.reasoningEffort ??
                    ReasoningEffort.Medium,
                },
                transcription: defaultInferenceOptions.transcription,
                fileInspection: defaultInferenceOptions.fileInspection,
              });
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

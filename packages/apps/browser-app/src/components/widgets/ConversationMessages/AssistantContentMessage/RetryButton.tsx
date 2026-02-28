import type { Conversation, Message } from "@superego/backend";
import { PiArrowsClockwise } from "react-icons/pi";
import { useIntl } from "react-intl";
import { useGlobalData } from "../../../../business-logic/backend/GlobalData.js";
import { useRetryLastResponse } from "../../../../business-logic/backend/hooks.js";
import useDefaultInferenceOptions from "../../../../business-logic/inference/useDefaultInferenceOptions.js";
import isEmpty from "../../../../utils/isEmpty.js";
import last from "../../../../utils/last.js";
import ModelActionMenu from "../ModelActionMenu/ModelActionMenu.js";
import makeModelActionMenuItems from "../ModelActionMenu/makeModelActionMenuItems.js";

interface Props {
  conversation: Conversation;
  message: Message.ContentAssistant;
  className: string;
}
export default function RetryButton({
  conversation,
  message,
  className,
}: Props) {
  const intl = useIntl();

  const { globalSettings } = useGlobalData();
  const defaultInferenceOptions = useDefaultInferenceOptions();
  const { isPending, mutate } = useRetryLastResponse();

  const models = makeModelActionMenuItems(
    globalSettings.inference.providers,
    message.inferenceOptions.completion.providerModelRef,
  );

  return conversation.canRetryLastResponse &&
    message === last(conversation.messages) &&
    !isEmpty(models) ? (
    <ModelActionMenu
      icon={<PiArrowsClockwise />}
      label={
        isPending
          ? intl.formatMessage({ defaultMessage: "Retrying..." })
          : intl.formatMessage({ defaultMessage: "Retry response" })
      }
      models={models}
      onModelAction={(providerModelRef) =>
        mutate(conversation.id, {
          completion: {
            providerModelRef,
            reasoningEffort:
              message.inferenceOptions.completion.reasoningEffort,
          },
          transcription: defaultInferenceOptions.transcription,
          fileInspection: defaultInferenceOptions.fileInspection,
        })
      }
      isDisabled={isPending}
      className={className}
    />
  ) : null;
}

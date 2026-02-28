import type { Conversation, Message } from "@superego/backend";
import { inferenceOptionsHas } from "@superego/shared-utils";
import { PiArrowsClockwise } from "react-icons/pi";
import { useIntl } from "react-intl";
import { useRetryLastResponse } from "../../../../business-logic/backend/hooks.js";
import useDefaultInferenceOptions from "../../../../business-logic/inference/useDefaultInferenceOptions.js";
import last from "../../../../utils/last.js";
import IconButton from "../../../design-system/IconButton/IconButton.js";

interface Props {
  conversation: Conversation;
  message: Message;
  className: string;
}
export default function RetryButton({
  conversation,
  message,
  className,
}: Props) {
  const intl = useIntl();

  const defaultInferenceOptions = useDefaultInferenceOptions();
  const { isPending, mutate } = useRetryLastResponse();

  return conversation.canRetryLastResponse &&
    message === last(conversation.messages) &&
    inferenceOptionsHas(defaultInferenceOptions, "completion") ? (
    <IconButton
      variant="invisible"
      label={
        isPending
          ? intl.formatMessage({ defaultMessage: "Retrying..." })
          : intl.formatMessage({ defaultMessage: "Retry response" })
      }
      onPress={() => mutate(conversation.id, defaultInferenceOptions)}
      className={className}
    >
      <PiArrowsClockwise />
    </IconButton>
  ) : null;
}

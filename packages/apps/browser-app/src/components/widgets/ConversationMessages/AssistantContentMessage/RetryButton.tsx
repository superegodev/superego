import type {
  Conversation,
  InferenceOptions,
  Message,
} from "@superego/backend";
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
    defaultInferenceOptions.completion ? (
    <IconButton
      variant="invisible"
      label={
        isPending
          ? intl.formatMessage({ defaultMessage: "Retrying..." })
          : intl.formatMessage({ defaultMessage: "Retry response" })
      }
      onPress={() =>
        mutate(
          conversation.id,
          // TypeScript doesn't understand, but since we're in the branch
          // defaultInferenceOptions.completion !== null, this cast is safe.
          defaultInferenceOptions as InferenceOptions<"completion">,
        )
      }
      className={className}
    >
      <PiArrowsClockwise />
    </IconButton>
  ) : null;
}

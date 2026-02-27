import type {
  Conversation,
  ConversationStatus,
  InferenceOptions,
} from "@superego/backend";
import { PiArrowCounterClockwiseBold } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import { useRecoverConversation } from "../../../business-logic/backend/hooks.js";
import useDefaultInferenceOptions from "../../../business-logic/inference/useDefaultInferenceOptions.js";
import CodeBlock from "../../design-system/CodeBlock/CodeBlock.js";
import Disclosure from "../../design-system/Disclosure/Disclosure.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import * as cs from "./ConversationMessages.css.js";

interface Props {
  conversation: Conversation & { status: ConversationStatus.Error };
}
export default function ErrorMessage({ conversation }: Props) {
  const intl = useIntl();

  const defaultInferenceOptions = useDefaultInferenceOptions();
  const { mutate } = useRecoverConversation();
  const { cause } = conversation.error.details;
  return (
    <div className={cs.ErrorMessage.root}>
      <div className={cs.ErrorMessage.message}>
        <FormattedMessage defaultMessage="The assistant encountered an error." />
        {defaultInferenceOptions.completion ? (
          <IconButton
            label={intl.formatMessage({ defaultMessage: "Retry" })}
            variant="invisible"
            onPress={() =>
              mutate(
                conversation.id,
                // TypeScript doesn't understand, but since we're in the branch
                // defaultInferenceOptions.completion !== null, this cast is
                // safe.
                defaultInferenceOptions as InferenceOptions<"completion">,
              )
            }
            className={cs.ErrorMessage.retryButton}
          >
            <PiArrowCounterClockwiseBold />
          </IconButton>
        ) : null}
      </div>
      <Disclosure
        title={intl.formatMessage({ defaultMessage: "Details" })}
        panelClassName={cs.ErrorMessage.disclosurePanel}
      >
        <CodeBlock
          language="json"
          code={JSON.stringify(cause)}
          showCopyButton={true}
        />
      </Disclosure>
    </div>
  );
}

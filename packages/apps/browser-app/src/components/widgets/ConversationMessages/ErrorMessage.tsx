import type { Conversation, ConversationStatus } from "@superego/backend";
import { PiArrowCounterClockwiseBold } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { useRecoverConversation } from "../../../business-logic/backend/hooks.js";
import CodeBlock from "../../design-system/CodeBlock/CodeBlock.js";
import Disclosure from "../../design-system/Disclosure/Disclosure.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import * as cs from "./ConversationMessages.css.js";

interface Props {
  conversation: Conversation & { status: ConversationStatus.Error };
}
export default function ErrorMessage({ conversation }: Props) {
  const intl = useIntl();

  const { inference } = useGlobalData().globalSettings;
  const { mutate } = useRecoverConversation();
  const { cause } = conversation.error.details;
  // TODO_AI:
  // - default to the same model that was used, not to the default model
  // - allow to choose a different model to recover the conversation
  return (
    <div className={cs.ErrorMessage.root}>
      <div className={cs.ErrorMessage.message}>
        <FormattedMessage defaultMessage="The assistant encountered an error." />
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Retry" })}
          variant="invisible"
          onPress={() =>
            mutate(conversation.id, {
              providerModelRef: inference.defaults.completion!,
            })
          }
          className={cs.ErrorMessage.retryButton}
        >
          <PiArrowCounterClockwiseBold />
        </IconButton>
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

import {
  type Conversation,
  type ConversationStatus,
  MessageRole,
} from "@superego/backend";
import { PiArrowCounterClockwiseBold } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { useRecoverConversation } from "../../../business-logic/backend/hooks.js";
import useDefaultInferenceOptions from "../../../business-logic/inference/useDefaultInferenceOptions.js";
import isEmpty from "../../../utils/isEmpty.js";
import CodeBlock from "../../design-system/CodeBlock/CodeBlock.js";
import Disclosure from "../../design-system/Disclosure/Disclosure.js";
import * as cs from "./ConversationMessages.css.js";
import ModelActionMenu from "./ModelActionMenu/ModelActionMenu.js";
import makeModelActionMenuItems from "./ModelActionMenu/makeModelActionMenuItems.js";

interface Props {
  conversation: Conversation & { status: ConversationStatus.Error };
}
export default function ErrorMessage({ conversation }: Props) {
  const intl = useIntl();

  const { globalSettings } = useGlobalData();
  const defaultInferenceOptions = useDefaultInferenceOptions();
  const { mutate } = useRecoverConversation();
  const { cause } = conversation.error.details;

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
        <FormattedMessage defaultMessage="The assistant encountered an error." />
        {!isEmpty(models) ? (
          <ModelActionMenu
            icon={<PiArrowCounterClockwiseBold />}
            label={intl.formatMessage({ defaultMessage: "Retry" })}
            models={models}
            onModelAction={(providerModelRef) =>
              mutate(conversation.id, {
                completion: { providerModelRef },
                transcription: defaultInferenceOptions.transcription,
                fileInspection: defaultInferenceOptions.fileInspection,
              })
            }
            className={cs.ErrorMessage.retryButton}
          />
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

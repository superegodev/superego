import { AssistantName, ConversationFormat } from "@superego/backend";
import { FormattedMessage, useIntl } from "react-intl";
import {
  useContinueConversation,
  useStartConversation,
} from "../../../business-logic/backend/hooks.js";
import ConversationMessages from "../../design-system/ConversationMessages/ConversationMessages.jsx";
import Shell from "../../design-system/Shell/Shell.js";
import UserMessageContentInput from "../../design-system/UserMessageContentInput/UserMessageContentInput.js";
import * as cs from "./Home.css.js";
import logo from "./logo.avif";

export default function Home() {
  const intl = useIntl();
  const {
    result: startConversationResult,
    mutate: startConversation,
    isPending: isStartingConversation,
  } = useStartConversation();
  const {
    result: continueConversationResult,
    mutate: continueConversation,
    isPending: isContinuingConversation,
  } = useContinueConversation();
  const isAwaitingNextMessage =
    isStartingConversation || isContinuingConversation;
  const conversation =
    continueConversationResult?.data ?? startConversationResult?.data;
  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Content>
        <div className={cs.Home.root}>
          <img
            src={logo}
            alt={intl.formatMessage({
              defaultMessage:
                "Superego Logo - A low detail, low-poly painting of Freud's face",
            })}
            className={cs.Home.logo}
          />
          <h1 className={cs.Home.title}>
            <FormattedMessage defaultMessage="Superego" />
          </h1>
          <h2 className={cs.Home.tagLine}>
            <FormattedMessage defaultMessage="Your Life's Database" />
          </h2>
          {conversation ? (
            <ConversationMessages conversation={conversation} />
          ) : null}
          {isAwaitingNextMessage ? "Thinking..." : null}
          <br />
          <br />
          <UserMessageContentInput
            onSend={(userMessageContent) => {
              if (!conversation) {
                startConversation(
                  AssistantName.DocumentCreator,
                  ConversationFormat.Text,
                  userMessageContent,
                );
              } else {
                continueConversation(conversation.id, userMessageContent);
              }
            }}
            placeholder={intl.formatMessage({
              defaultMessage: "How can I help you?",
            })}
            autoFocus={true}
            isDisabled={isAwaitingNextMessage}
          />
        </div>
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}

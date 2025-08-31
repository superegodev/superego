import { type Conversation, ConversationFormat } from "@superego/backend";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  useContinueConversation,
  useStartConversation,
} from "../../../business-logic/backend/hooks.js";
import ConversationMessages from "../../design-system/ConversationMessages/ConversationMessages.jsx";
import Shell from "../../design-system/Shell/Shell.js";
import UserMessageContentInput from "../../design-system/UserMessageContentInput/UserMessageContentInput.js";
import Hero from "./Hero.jsx";
import * as cs from "./Home.css.js";

export default function Home() {
  const intl = useIntl();
  const [conversation, setConversation] = useState<Conversation | null>(null);
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
  useEffect(() => {
    setConversation(
      continueConversationResult?.data ??
        startConversationResult?.data ??
        conversation,
    );
  }, [conversation, startConversationResult, continueConversationResult]);
  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Content>
        <div
          className={
            cs.Home.root[
              conversation ? "withConversation" : "withoutConversation"
            ]
          }
        >
          <Hero isMinified={!!conversation} />
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
            className={cs.Home.userMessageContentInput}
          />
          <div
            className={cs.Home.spinner}
            style={{ visibility: isAwaitingNextMessage ? "visible" : "hidden" }}
          >
            <FormattedMessage defaultMessage="Thinking..." />
          </div>
          {conversation ? (
            <ConversationMessages
              conversation={conversation}
              className={cs.Home.conversationMessages}
            />
          ) : null}
        </div>
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}

import { ConversationFormat, type Message } from "@superego/backend";
import { PiClockCounterClockwise } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import { useStartConversation } from "../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import Alert from "../../design-system/Alert/Alert.jsx";
import Link from "../../design-system/Link/Link.jsx";
import ResultError from "../../design-system/ResultError/ResultError.jsx";
import Shell from "../../design-system/Shell/Shell.jsx";
import UserMessageContentInput from "../../design-system/UserMessageContentInput/UserMessageContentInput.jsx";
import * as cs from "./Assistant.css.js";
import Hero from "./Hero.jsx";

export default function Assistant() {
  const intl = useIntl();
  const { navigateTo } = useNavigationState();

  const { result, mutate, isPending } = useStartConversation();
  const onSend = async (userMessageContent: Message.User["content"]) => {
    const { success, data } = await mutate(
      ConversationFormat.Text,
      userMessageContent,
    );
    if (success) {
      navigateTo({ name: RouteName.Conversation, conversationId: data.id });
    }
  };
  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Content>
        <div className={cs.Assistant.root}>
          <Hero />
          <UserMessageContentInput
            onSend={onSend}
            autoFocus={true}
            isProcessingMessage={isPending}
          />
          <Link
            to={{ name: RouteName.Conversations }}
            className={cs.Assistant.historyLink}
          >
            <PiClockCounterClockwise className={cs.Assistant.historyLinkIcon} />
            <FormattedMessage defaultMessage="Previous conversations" />
          </Link>
          {result?.error ? (
            <Alert
              variant="error"
              title={intl.formatMessage({
                defaultMessage: "Error starting conversation",
              })}
            >
              <ResultError error={result.error} />
            </Alert>
          ) : null}
        </div>
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}

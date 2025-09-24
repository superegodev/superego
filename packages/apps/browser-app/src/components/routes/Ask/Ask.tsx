import {
  AssistantName,
  ConversationFormat,
  type Message,
} from "@superego/backend";
import { PiClockCounterClockwise } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import { useStartConversation } from "../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import Link from "../../design-system/Link/Link.js";
import ResultErrors from "../../design-system/ResultErrors/ResultErrors.js";
import Shell from "../../design-system/Shell/Shell.js";
import UserMessageContentInput from "../../widgets/UserMessageContentInput/UserMessageContentInput.js";
import * as cs from "./Ask.css.js";
import Hero from "./Hero.js";

export default function Ask() {
  const intl = useIntl();
  const { navigateTo } = useNavigationState();

  const { result, mutate, isPending } = useStartConversation();
  const onSend = async (userMessageContent: Message.User["content"]) => {
    const { success, data } = await mutate(
      AssistantName.Factotum,
      ConversationFormat.Text,
      userMessageContent,
    );
    if (success) {
      navigateTo({ name: RouteName.Conversation, conversationId: data.id });
    }
  };
  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header />
      <Shell.Panel.Content className={cs.Ask.panelContent}>
        <Hero />
        <UserMessageContentInput
          conversation={null}
          onSend={onSend}
          isSending={isPending}
          placeholder={intl.formatMessage({
            defaultMessage: "How can I help you?",
          })}
          autoFocus={true}
        />
        <Link
          to={{ name: RouteName.Conversations }}
          className={cs.Ask.historyLink}
        >
          <PiClockCounterClockwise className={cs.Ask.historyLinkIcon} />
          <FormattedMessage defaultMessage="Previous conversations" />
        </Link>
        {result?.error ? <ResultErrors errors={[result.error]} /> : null}
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}

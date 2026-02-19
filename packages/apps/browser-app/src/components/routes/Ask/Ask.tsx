import { AssistantName, type Message } from "@superego/backend";
import type { ReactNode } from "react";
import { PiClockCounterClockwise } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { useStartConversation } from "../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import isEmpty from "../../../utils/isEmpty.js";
import Link from "../../design-system/Link/Link.js";
import ResultErrors from "../../design-system/ResultErrors/ResultErrors.js";
import Shell from "../../design-system/Shell/Shell.js";
import UserMessageContentInput from "../../widgets/UserMessageContentInput/UserMessageContentInput.js";
import * as cs from "./Ask.css.js";
import Hero from "./Hero.js";

export default function Ask() {
  const intl = useIntl();
  const { navigateTo } = useNavigationState();
  const { collections } = useGlobalData();

  const { result, mutate, isPending } = useStartConversation();
  const onSend = async (userMessageContent: Message.User["content"]) => {
    const { success, data } = await mutate(
      AssistantName.Factotum,
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
        <Hero hasWelcome={isEmpty(collections)} />
        {isEmpty(collections) ? (
          <div className={cs.Welcome.root}>
            <p className={cs.Welcome.paragraph}>
              <FormattedMessage defaultMessage="Welcome! Superego is a personal knowledge management app that lets you organize your data into collections with custom schemas." />
            </p>
            <p className={cs.Welcome.paragraph}>
              <FormattedMessage
                defaultMessage="You can <createCollectionLink>create your collection</createCollectionLink> or install some pre-made ones from the <bazaarLink>bazaar</bazaarLink>."
                values={{
                  createCollectionLink: (chunks: ReactNode) => (
                    <Link to={{ name: RouteName.CreateCollectionAssisted }}>
                      {chunks}
                    </Link>
                  ),
                  bazaarLink: (chunks: ReactNode) => (
                    <Link to={{ name: RouteName.Bazaar }}>{chunks}</Link>
                  ),
                }}
              />
            </p>
          </div>
        ) : null}
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

import {
  AssistantName,
  type Conversation as ConversationB,
  type ConversationId,
  ConversationStatus,
} from "@superego/backend";
import { memo, useState } from "react";
import { PiLightning, PiLightningSlash, PiTrash } from "react-icons/pi";
import { useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { getConversationQuery } from "../../../business-logic/backend/hooks.js";
import useLocalStorageItem from "../../../business-logic/local-storage/useLocalStorageItem.js";
import WellKnownKey from "../../../business-logic/local-storage/WellKnownKey.js";
import ScreenSize from "../../../business-logic/screen-size/ScreenSize.js";
import useScreenSize from "../../../business-logic/screen-size/useScreenSize.js";
import ConversationUtils from "../../../utils/ConversationUtils.js";
import RouteLevelErrors from "../../design-system/RouteLevelErrors/RouteLevelErrors.js";
import Shell from "../../design-system/Shell/Shell.js";
import Chat from "../../widgets/Chat/Chat.js";
import DeleteConversationModalForm from "../../widgets/DeleteConversationModalForm/DeleteConversationModalForm.js";
import * as cs from "./Conversation.css.js";

interface Props {
  conversationId: ConversationId;
}
export default function Conversation({ conversationId }: Props) {
  const intl = useIntl();
  const screenSize = useScreenSize();
  return (
    <DataLoader
      queries={[
        getConversationQuery([conversationId], {
          pollingInterval: 200,
          pollWhile: (result) =>
            result?.data?.status === ConversationStatus.Processing,
        }),
      ]}
      renderLoading={() => (
        <Shell.Panel slot="Main">
          <Shell.Panel.Header
            title={intl.formatMessage({
              defaultMessage: "🤖\u2002Conversations",
            })}
          />
        </Shell.Panel>
      )}
      renderErrors={(errors) => (
        <RouteLevelErrors
          headerTitle={
            screenSize > ScreenSize.Small
              ? intl.formatMessage(
                  {
                    defaultMessage: "🤖\u2002Conversations » {conversationId}",
                  },
                  { conversationId },
                )
              : "🤖\u2002 {conversationId}"
          }
          errors={errors}
        />
      )}
    >
      {(conversation) => (
        <MemoizedConversation
          conversation={conversation}
          screenSize={screenSize}
        />
      )}
    </DataLoader>
  );
}

interface MemoizedConversationProps {
  conversation: ConversationB;
  screenSize: ScreenSize;
}
// We want to memoize the conversation in order to avoid everything re-rendering
// continuously when DataLoader is polling for an update. Currently if the
// conversation has the same id, status, and number of messages, it's guaranteed
// to be the same, so we can use those properties as memoization key.
const MemoizedConversation = memo(
  function MemoizedConversation({
    conversation,
    screenSize,
  }: MemoizedConversationProps) {
    const intl = useIntl();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [showToolCalls, setShowToolCalls] = useLocalStorageItem(
      WellKnownKey.ShowToolCalls,
      false,
    );
    return (
      <Shell.Panel slot="Main">
        <Shell.Panel.Header
          title={
            screenSize > ScreenSize.Small
              ? intl.formatMessage(
                  {
                    defaultMessage: "🤖\u2002Conversations » {conversation}",
                  },
                  {
                    conversation: ConversationUtils.getDisplayTitle(
                      conversation,
                      intl,
                    ),
                  },
                )
              : `🤖\u2002 ${ConversationUtils.getDisplayTitle(
                  conversation,
                  intl,
                )}`
          }
          actionsAriaLabel={intl.formatMessage({
            defaultMessage: "Conversation actions",
          })}
          actions={[
            {
              label: intl.formatMessage({
                defaultMessage: "Toggle tool calls",
              }),
              icon: showToolCalls ? <PiLightningSlash /> : <PiLightning />,
              onPress: () => setShowToolCalls(!showToolCalls),
            },
            {
              label: intl.formatMessage({
                defaultMessage: "Delete conversation",
              }),
              icon: <PiTrash />,
              onPress: () => setIsDeleteModalOpen(true),
            },
          ]}
        />
        <Shell.Panel.Content className={cs.Conversation.panelContent}>
          <Chat
            conversation={conversation}
            showToolsCalls={showToolCalls}
            userMessageContentInputPlaceholder={
              conversation.assistant === AssistantName.CollectionCreator
                ? intl.formatMessage({
                    defaultMessage: "What kind of data do you want to store?",
                  })
                : intl.formatMessage({
                    defaultMessage: "How can I help you?",
                  })
            }
          />
          <DeleteConversationModalForm
            key={`DeleteConversationModalForm_${conversation.id}`}
            conversation={conversation}
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
          />
        </Shell.Panel.Content>
      </Shell.Panel>
    );
  },
  (prev, next) =>
    prev.screenSize === next.screenSize &&
    prev.conversation.id === next.conversation.id &&
    prev.conversation.status === next.conversation.status &&
    prev.conversation.messages.length === next.conversation.messages.length &&
    prev.conversation.hasOutdatedContext ===
      next.conversation.hasOutdatedContext,
);

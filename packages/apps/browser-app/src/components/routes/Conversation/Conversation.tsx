import {
  AssistantName,
  type ConversationId,
  ConversationStatus,
} from "@superego/backend";
import { useState } from "react";
import { PiLightning, PiLightningSlash, PiTrash } from "react-icons/pi";
import { useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { getConversationQuery } from "../../../business-logic/backend/hooks.js";
import ConversationUtils from "../../../utils/ConversationUtils.js";
import RouteLevelErrors from "../../design-system/RouteLevelErrors/RouteLevelErrors.jsx";
import Shell from "../../design-system/Shell/Shell.js";
import Chat from "../../widgets/Chat/Chat.js";
import DeleteConversationModalForm from "../../widgets/DeleteConversationModalForm/DeleteConversationModalForm.js";
import * as cs from "./Conversation.css.js";

interface Props {
  conversationId: ConversationId;
}
export default function Conversation({ conversationId }: Props) {
  const intl = useIntl();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showToolCalls, setShowToolCalls] = useState(false);
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
          headerTitle={intl.formatMessage(
            { defaultMessage: "🤖\u2002Conversations » {conversationId}" },
            { conversationId },
          )}
          errors={errors}
        />
      )}
    >
      {(conversation) => (
        <Shell.Panel slot="Main">
          <Shell.Panel.Header
            title={intl.formatMessage(
              {
                defaultMessage:
                  "🤖\u2002Conversations » {assistant} » {conversation}",
              },
              {
                assistant:
                  conversation.assistant === AssistantName.CollectionCreator
                    ? "Collection Creator"
                    : "Factotum",
                conversation: ConversationUtils.getDisplayTitle(
                  conversation,
                  intl,
                ),
              },
            )}
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
              key={`DeleteConversationModalForm_${conversationId}`}
              conversation={conversation}
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
            />
          </Shell.Panel.Content>
        </Shell.Panel>
      )}
    </DataLoader>
  );
}

import { type ConversationId, ConversationStatus } from "@superego/backend";
import { useState } from "react";
import { PiLightning, PiLightningSlash, PiTrash } from "react-icons/pi";
import { useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { getConversationQuery } from "../../../business-logic/backend/hooks.js";
import ConversationUtils from "../../../utils/ConversationUtils.js";
import Shell from "../../design-system/Shell/Shell.js";
import Chat from "./Chat.js";
import DeleteConversationModalForm from "./DeleteConversationModalForm.js";
import * as cs from "./FactotumConversation.css.js";

interface Props {
  conversationId: ConversationId;
}
export default function FactotumConversation({ conversationId }: Props) {
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
    >
      {(conversation) => (
        <Shell.Panel slot="Main">
          <Shell.Panel.Header
            title={intl.formatMessage(
              { defaultMessage: "🤖\u2002Conversations » {conversation}" },
              {
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
          <Shell.Panel.Content className={cs.FactotumConversation.panelContent}>
            <Chat conversation={conversation} showToolsCalls={showToolCalls} />
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

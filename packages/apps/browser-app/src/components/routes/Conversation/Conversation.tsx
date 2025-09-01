import { type ConversationId, ConversationStatus } from "@superego/backend";
import { useState } from "react";
import { PiTrash } from "react-icons/pi";
import { useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { getConversationQuery } from "../../../business-logic/backend/hooks.js";
import ConversationUtils from "../../../utils/ConversationUtils.js";
import Shell from "../../design-system/Shell/Shell.js";
import Chat from "./Chat.jsx";
import * as cs from "./Conversation.css.js";
import DeleteConversationModalForm from "./DeleteConversationModalForm.jsx";

interface Props {
  conversationId: ConversationId;
}
export default function Conversation({ conversationId }: Props) {
  const intl = useIntl();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  return (
    <DataLoader
      queries={[
        getConversationQuery([conversationId], {
          pollingInterval: 200,
          pollWhile: (result) => {
            console.log(result?.data);
            return result?.data?.status === ConversationStatus.Processing;
          },
        }),
      ]}
    >
      {(conversation) => (
        <Shell.Panel slot="Main">
          <Shell.Panel.Header
            title={intl.formatMessage(
              { defaultMessage: "🤖\u2002Conversation » {conversation}" },
              {
                conversation: ConversationUtils.getDisplayName(conversation),
              },
            )}
            actionsAriaLabel={intl.formatMessage({
              defaultMessage: "Conversation actions",
            })}
            actions={[
              {
                label: intl.formatMessage({
                  defaultMessage: "Delete conversation",
                }),
                icon: <PiTrash />,
                onPress: () => setIsDeleteModalOpen(true),
              },
            ]}
          />
          <Shell.Panel.Content className={cs.Conversation.root}>
            <Chat conversation={conversation} />
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

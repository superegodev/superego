import { type Conversation, ConversationStatus } from "@superego/backend";
import { useCallback, useEffect } from "react";
import useSessionStorageItem from "../../../business-logic/local-storage/useSessionStorageItem.js";
import WellKnownKey from "../../../business-logic/local-storage/WellKnownKey.js";

type UseRecoveringConversation = {
  isRecovering: boolean;
  setIsRecovering: (value: boolean) => void;
};

export default function useRecoveringConversation(
  conversation: Conversation,
): UseRecoveringConversation {
  const [ids, setIds] = useSessionStorageItem<string[]>(
    WellKnownKey.RecoveringConversationIds,
    [],
  );

  const isRecovering = ids.includes(conversation.id);

  const setIsRecovering = useCallback(
    (value: boolean) => {
      setIds((previousIds) => {
        if (value) {
          return previousIds.includes(conversation.id)
            ? previousIds
            : [...previousIds, conversation.id];
        }
        return previousIds.filter((id) => id !== conversation.id);
      });
    },
    [setIds, conversation.id],
  );

  useEffect(() => {
    if (conversation.status !== ConversationStatus.Processing && isRecovering) {
      setIsRecovering(false);
    }
  }, [conversation.status, isRecovering, setIsRecovering]);

  return { isRecovering, setIsRecovering };
}

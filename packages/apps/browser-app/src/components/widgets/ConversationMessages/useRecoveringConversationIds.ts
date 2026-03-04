import type { ConversationId } from "@superego/backend";
import { useCallback } from "react";
import useSessionStorageItem from "../../../business-logic/local-storage/useSessionStorageItem.js";
import WellKnownKey from "../../../business-logic/local-storage/WellKnownKey.js";

type UseRecoveringConversationIds = {
  isRecovering: boolean;
  setIsRecovering: (value: boolean) => void;
};

export default function useRecoveringConversationIds(
  conversationId: ConversationId,
): UseRecoveringConversationIds {
  const [ids, setIds] = useSessionStorageItem<string[]>(
    WellKnownKey.RecoveringConversationIds,
    [],
  );

  const isRecovering = ids.includes(conversationId);

  const setIsRecovering = useCallback(
    (value: boolean) => {
      if (value) {
        setIds([...ids, conversationId]);
      } else {
        setIds(ids.filter((id) => id !== conversationId));
      }
    },
    [ids, setIds, conversationId],
  );

  return { isRecovering, setIsRecovering };
}

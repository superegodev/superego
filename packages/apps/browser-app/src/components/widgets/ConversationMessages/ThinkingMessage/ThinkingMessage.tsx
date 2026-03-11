import { type Conversation, ConversationStatus } from "@superego/backend";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import DataLoader from "../../../../business-logic/backend/DataLoader.js";
import { getLiveConversationQuery } from "../../../../business-logic/backend/hooks.js";
import ThinkingMessageContent from "./ThinkingMessageContent.js";

interface Props {
  conversation: Conversation;
}
export default function ThinkingMessage({ conversation }: Props) {
  return (
    <DataLoader
      queries={[
        getLiveConversationQuery([conversation.id], {
          pollingInterval: 200,
          pollWhile: (result) =>
            conversation.status === ConversationStatus.Processing ||
            result?.data !== null,
        }),
      ]}
      renderLoading={() => (
        <ThinkingMessageContent conversation={conversation} />
      )}
    >
      {(liveConversation) => (
        <InvalidateOnNullLiveConversation
          conversationId={conversation.id}
          liveConversation={liveConversation as Conversation | null}
        >
          <ThinkingMessageContent
            conversation={
              (liveConversation as Conversation | null) ?? conversation
            }
          />
        </InvalidateOnNullLiveConversation>
      )}
    </DataLoader>
  );
}

// When the live conversation disappears (backend clears it from memory in a
// `finally` block), there's a brief window before the DB transaction commits
// the updated status (e.g. Error). A single `getConversation` invalidation can
// land in that window and get stale `Processing` data back, so we keep
// invalidating on an interval until the parent unmounts this component (which
// happens once `getConversation` returns a non-Processing status).
//
// (Note: this is not a hook because we can't use hooks inside the DataLoader
// render function.)
function InvalidateOnNullLiveConversation({
  conversationId,
  liveConversation,
  children,
}: {
  conversationId: string;
  liveConversation: Conversation | null;
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const liveConversationIsNull = liveConversation === null;
  useEffect(() => {
    if (!liveConversationIsNull) {
      return;
    }
    queryClient.invalidateQueries({
      queryKey: ["getConversation", conversationId],
    });
    const intervalId = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: ["getConversation", conversationId],
      });
    }, 200);
    return () => clearInterval(intervalId);
  }, [liveConversationIsNull, conversationId, queryClient]);

  return children;
}

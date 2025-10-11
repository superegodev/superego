import { type Collection, DownSyncStatus } from "@superego/backend";
import type { Milliseconds } from "@superego/global-types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const POLLING_INTERVAL: Milliseconds = 200;

export default function usePollForDownSyncFinished(
  collection: Collection | null,
) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (collection?.remote?.syncState.down.status === DownSyncStatus.Syncing) {
      const intervalId = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ["listCollections"] });
        queryClient.invalidateQueries({
          queryKey: ["listDocuments", collection.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["getDocument", collection.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["getDocumentVersion", collection.id],
        });
      }, POLLING_INTERVAL);
      return () => clearInterval(intervalId);
    }
    return;
  }, [collection, queryClient]);
}

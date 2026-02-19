import { createContext } from "react";
import type CardMovedEvent from "./CardMovedEvent.js";

interface KanbanBoardContextValue {
  onCardMoved: ((event: CardMovedEvent) => void) | undefined;
}

export default createContext<KanbanBoardContextValue>({
  onCardMoved: undefined,
});

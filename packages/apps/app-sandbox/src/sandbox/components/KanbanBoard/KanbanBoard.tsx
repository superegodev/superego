import type { ReactNode } from "react";
import Card from "./Card.js";
import type CardMovedEvent from "./CardMovedEvent.js";
import Column from "./Column.js";
import * as cs from "./KanbanBoard.css.js";
import KanbanBoardContext from "./KanbanBoardContext.js";

interface Props {
  onCardMoved?: ((event: CardMovedEvent) => void) | undefined;
  children: ReactNode;
}
export default function KanbanBoard({ onCardMoved, children }: Props) {
  return (
    <KanbanBoardContext.Provider value={{ onCardMoved }}>
      <div className={cs.KanbanBoard.root}>{children}</div>
    </KanbanBoardContext.Provider>
  );
}

KanbanBoard.Column = Column;
KanbanBoard.Card = Card;

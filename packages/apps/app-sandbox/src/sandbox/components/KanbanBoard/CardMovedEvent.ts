import type { ItemDropTarget, Key } from "react-aria";

export default interface CardMovedEvent {
  cardId: Key;
  fromColumnId: Key;
  toColumnId: Key;
  target: ItemDropTarget | { type: "root" };
}

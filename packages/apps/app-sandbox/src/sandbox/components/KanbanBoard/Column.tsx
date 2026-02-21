import clsx from "clsx";
import { type ReactNode, useContext } from "react";
import type { Key } from "react-aria-components";
import {
  DropIndicator,
  GridList,
  isTextDropItem,
  useDragAndDrop,
} from "react-aria-components";
import * as cs from "./KanbanBoard.css.js";
import KanbanBoardContext from "./KanbanBoardContext.js";

const KANBAN_CARD_TYPE = "application/x-kanban-card-id";
const KANBAN_SOURCE_COLUMN_TYPE = "application/x-kanban-source-column-id";

interface Props {
  id: Key;
  title: ReactNode;
  ariaLabel: string;
  children: ReactNode;
}
export default function Column({ id, title, ariaLabel, children }: Props) {
  const { onCardMoved } = useContext(KanbanBoardContext);

  const { dragAndDropHooks } = useDragAndDrop({
    getItems(keys) {
      return [...keys].map((key) => ({
        [KANBAN_CARD_TYPE]: String(key),
        [KANBAN_SOURCE_COLUMN_TYPE]: String(id),
      }));
    },
    acceptedDragTypes: [KANBAN_CARD_TYPE],
    getDropOperation: () => "move",
    onReorder(evt) {
      onCardMoved?.({
        cardId: [...evt.keys][0]!,
        fromColumnId: id,
        toColumnId: id,
        target: evt.target,
      });
    },
    async onInsert(e) {
      const [item] = e.items;
      if (item && isTextDropItem(item) && item.types.has(KANBAN_CARD_TYPE)) {
        onCardMoved?.({
          cardId: await item.getText(KANBAN_CARD_TYPE),
          fromColumnId: await item.getText(KANBAN_SOURCE_COLUMN_TYPE),
          toColumnId: id,
          target: e.target,
        });
      }
    },
    async onRootDrop(e) {
      const [item] = e.items;
      if (item && isTextDropItem(item) && item.types.has(KANBAN_CARD_TYPE)) {
        onCardMoved?.({
          cardId: await item.getText(KANBAN_CARD_TYPE),
          fromColumnId: await item.getText(KANBAN_SOURCE_COLUMN_TYPE),
          toColumnId: id,
          target: { type: "root" },
        });
      }
    },
    renderDropIndicator(target) {
      return (
        <DropIndicator target={target} className={cs.DropIndicatorStyle.root} />
      );
    },
  });

  return (
    <div className={cs.Column.root}>
      <div className={cs.Column.header}>{title}</div>
      <GridList
        aria-label={ariaLabel}
        dragAndDropHooks={dragAndDropHooks}
        keyboardNavigationBehavior="tab"
        className={({ isDropTarget }) =>
          clsx(cs.Column.list.base, isDropTarget && cs.Column.list.dropTarget)
        }
        selectionMode="none"
        renderEmptyState={() => null}
      >
        {children}
      </GridList>
    </div>
  );
}

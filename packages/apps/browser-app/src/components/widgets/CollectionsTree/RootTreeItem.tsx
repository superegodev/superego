import type { CollectionCategoryId, CollectionId } from "@superego/backend";
import classnames from "../../../utils/classnames.js";
import * as cs from "./CollectionsTree.css.js";
import { useDropTreeItem } from "./dnd.js";

interface Props {
  onItemDropped: (
    droppedItemId: CollectionCategoryId | CollectionId,
    droppedOn: CollectionCategoryId | CollectionId | null,
  ) => void;
}
export default function RootTreeItem({ onItemDropped }: Props) {
  const {
    dropProps,
    isDropTarget,
    ref: dropTargetRef,
  } = useDropTreeItem(null, onItemDropped, false);
  return (
    <div
      {...dropProps}
      ref={dropTargetRef}
      className={classnames(
        cs.RootTreeItem.root,
        isDropTarget && cs.TreeItem.dropping,
      )}
    />
  );
}

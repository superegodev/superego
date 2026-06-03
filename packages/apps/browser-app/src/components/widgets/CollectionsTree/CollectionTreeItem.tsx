import type { CollectionCategoryId, CollectionId } from "@superego/backend";
import { RouteName, toHref, type Route } from "@superego/routing";
import { useRef } from "react";
import {
  TreeItem,
  TreeItemContent,
  type TreeItemProps,
} from "react-aria-components";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import useShell from "../../../business-logic/navigation/useShell.js";
import classnames from "../../../utils/classnames.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import * as cs from "./CollectionsTree.css.js";
import {
  useDragTreeItem,
  useDropTreeItem,
  useIsParentDropDisabled,
} from "./dnd.js";
import type * as tree from "./tree.js";
import TreeItemDragPreview from "./TreeItemDragPreview.js";

interface Props extends Partial<TreeItemProps> {
  item: tree.CollectionTreeItem;
  onItemDropped: (
    droppedItemId: CollectionCategoryId | CollectionId,
    droppedOn: CollectionCategoryId | CollectionId | null,
  ) => void;
}
export default function CollectionTreeItem({
  item,
  onItemDropped,
  ...props
}: Props) {
  const { closePrimarySidebar } = useShell();
  const { activeRoute } = useNavigationState();
  const to: Route = { name: RouteName.Collection, collectionId: item.id };
  const dragPreviewRef = useRef(null);
  const { dragProps, isDragging } = useDragTreeItem(item.id, dragPreviewRef);
  const isDropDisabled = useIsParentDropDisabled() || isDragging;
  const {
    dropProps,
    isDropTarget,
    ref: dropTargetRef,
  } = useDropTreeItem(item.id, onItemDropped, isDropDisabled);
  const displayAsActive =
    "collectionId" in activeRoute &&
    to.collectionId === activeRoute.collectionId;
  const displayName = CollectionUtils.getDisplayName(item.collection);
  return (
    <TreeItem
      href={toHref(to)}
      onPress={closePrimarySidebar}
      textValue={item.name}
      className={classnames(
        cs.TreeItem.root,
        displayAsActive && cs.TreeItem.active,
        isDragging && cs.TreeItem.dragging,
        isDropTarget && cs.TreeItem.dropping,
      )}
      {...props}
    >
      <TreeItemContent>
        <div
          {...dragProps}
          {...dropProps}
          ref={dropTargetRef}
          className={cs.CollectionTreeItem.contentContainer}
        >
          {displayName}
        </div>
        <TreeItemDragPreview ref={dragPreviewRef} name={displayName} />
      </TreeItemContent>
    </TreeItem>
  );
}

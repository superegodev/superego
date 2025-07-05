import type { CollectionCategoryId, CollectionId } from "@superego/backend";
import { type JSX, useRef, useState } from "react";
import {
  Button,
  Collection,
  TreeItem,
  TreeItemContent,
  type TreeItemContentRenderProps,
  type TreeItemProps,
} from "react-aria-components";
import { PiCaretDown, PiCaretRight } from "react-icons/pi";
import CollectionCategoryUtils from "../../../utils/CollectionCategoryUtils.js";
import classnames from "../../../utils/classnames.js";
import isEmpty from "../../../utils/isEmpty.js";
import CollectionCategoryActionsMenu from "./CollectionCategoryActionsMenu.js";
import * as cs from "./CollectionsTree.css.js";
import {
  IsParentDropDisabledProvider,
  useDragTreeItem,
  useDropTreeItem,
  useIsParentDropDisabled,
} from "./dnd.js";
import RenameCollectionCategoryModalForm from "./RenameCollectionCategoryModalForm.js";
import TreeItemDragPreview from "./TreeItemDragPreview.js";
import type * as tree from "./tree.js";

interface Props extends Partial<TreeItemProps> {
  item: tree.CollectionCategoryTreeItem;
  renderItem: (item: tree.TreeItem) => JSX.Element;
  onItemDropped: (
    draggedItem: CollectionCategoryId | CollectionId,
    droppedOn: CollectionCategoryId | CollectionId | null,
  ) => void;
  onCollectionCategoryDelete: (id: CollectionCategoryId) => void;
}
export default function CollectionCategoryTreeItem({
  item,
  renderItem,
  onItemDropped,
  onCollectionCategoryDelete,
  ...props
}: Props) {
  const [isRenameModalOpen, setRenameModalOpen] = useState(false);
  const dragPreviewRef = useRef(null);
  const { dragProps, isDragging } = useDragTreeItem(item.id, dragPreviewRef);
  const isDropDisabled = useIsParentDropDisabled() || isDragging;
  const {
    dropProps,
    isDropTarget,
    ref: dropTargetRef,
  } = useDropTreeItem(item.id, onItemDropped, isDropDisabled);
  const displayName = CollectionCategoryUtils.getDisplayName(
    item.collectionCategory,
  );
  return (
    <TreeItem
      textValue={item.name}
      className={classnames(
        cs.TreeItem.root,
        isDragging && cs.TreeItem.dragging,
        isDropTarget && cs.TreeItem.dropping,
      )}
      {...props}
    >
      <TreeItemContent>
        {({ isExpanded }: TreeItemContentRenderProps) => (
          <>
            <div
              {...dragProps}
              {...dropProps}
              ref={dropTargetRef}
              className={cs.CollectionCategoryTreeItem.contentContainer}
            >
              <Button
                slot="chevron"
                className={cs.CollectionCategoryTreeItem.expandButton}
              >
                {isExpanded ? <PiCaretDown /> : <PiCaretRight />}
              </Button>
              {displayName}
              <CollectionCategoryActionsMenu
                name={displayName}
                canDelete={isEmpty(item.children)}
                onRename={() => setRenameModalOpen(true)}
                onDelete={() => onCollectionCategoryDelete(item.id)}
              />
              <RenameCollectionCategoryModalForm
                collectionCategory={item.collectionCategory}
                isOpen={isRenameModalOpen}
                onClose={() => setRenameModalOpen(false)}
              />
            </div>
            <TreeItemDragPreview ref={dragPreviewRef} name={displayName} />
          </>
        )}
      </TreeItemContent>
      <IsParentDropDisabledProvider value={isDropDisabled}>
        <Collection items={item.children}>{renderItem}</Collection>
      </IsParentDropDisabledProvider>
    </TreeItem>
  );
}

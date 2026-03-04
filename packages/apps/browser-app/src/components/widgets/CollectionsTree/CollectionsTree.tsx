import type { CollectionCategoryId, CollectionId } from "@superego/backend";
import { Id } from "@superego/shared-utils";
import { useCollator } from "react-aria";
import { Tree } from "react-aria-components";
import { PiArrowBendRightUpBold } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import {
  useDeleteCollectionCategory,
  useUpdateCollectionCategory,
  useUpdateCollectionSettings,
} from "../../../business-logic/backend/hooks.js";
import classnames from "../../../utils/classnames.js";
import isEmpty from "../../../utils/isEmpty.js";
import CollectionCategoryTreeItem from "./CollectionCategoryTreeItem.js";
import * as cs from "./CollectionsTree.css.js";
import CollectionTreeItem from "./CollectionTreeItem.js";
import { IsParentDropDisabledProvider } from "./dnd.js";
import Header from "./Header.js";
import RootTreeItem from "./RootTreeItem.js";
import * as tree from "./tree.js";

interface Props {
  className?: string | undefined;
}
export default function CollectionsTree({ className }: Props) {
  const { collectionCategories, collections } = useGlobalData();
  const collator = useCollator();
  const intl = useIntl();
  const { mutate: deleteCollectionCategory } = useDeleteCollectionCategory();
  const { mutate: updateCollectionCategory } = useUpdateCollectionCategory();
  const { mutate: updateCollectionSettings } = useUpdateCollectionSettings();
  const onItemDropped = (
    droppedItemId: CollectionCategoryId | CollectionId,
    droppedOn: CollectionCategoryId | CollectionId | null,
  ) => {
    // If the item was dropped on a collection category, the target is the
    // collection category. Otherwise, it's the collection's collection
    // category.
    const target =
      droppedOn === null || Id.is.collectionCategory(droppedOn)
        ? droppedOn
        : (collections.find(({ id }) => id === droppedOn)?.settings
            .collectionCategoryId ?? null);
    if (Id.is.collectionCategory(droppedItemId)) {
      updateCollectionCategory(droppedItemId, { parentId: target });
    } else {
      updateCollectionSettings(droppedItemId, { collectionCategoryId: target });
    }
  };
  const collectionsTree = tree.makeTree(
    collectionCategories,
    collections,
    collator,
  );
  return (
    <IsParentDropDisabledProvider value={false}>
      <div className={classnames(cs.CollectionsTree.root, className)}>
        <Header alwaysShowToolbar={isEmpty(collectionsTree.children)} />
        <Tree
          aria-label={intl.formatMessage({
            defaultMessage: "Tree of collection categories and collections",
          })}
          selectionMode="none"
          items={collectionsTree.children}
          defaultExpandedKeys={collectionCategories.map(({ id }) => id)}
          className={cs.CollectionsTree.tree}
          renderEmptyState={() => (
            <div className={cs.CollectionsTree.emptyTree}>
              <div className={cs.CollectionsTree.emptyTreeText}>
                <FormattedMessage defaultMessage="Create collection to start." />
              </div>
              <PiArrowBendRightUpBold
                className={cs.CollectionsTree.emptyTreeIcon}
              />
            </div>
          )}
        >
          {function renderItem(item) {
            return item.type === tree.TreeItemType.CollectionCategory ? (
              <CollectionCategoryTreeItem
                item={item}
                renderItem={renderItem}
                onItemDropped={onItemDropped}
                onCollectionCategoryDelete={(id) =>
                  deleteCollectionCategory(id)
                }
              />
            ) : (
              <CollectionTreeItem item={item} onItemDropped={onItemDropped} />
            );
          }}
        </Tree>
        <RootTreeItem onItemDropped={onItemDropped} />
      </div>
    </IsParentDropDisabledProvider>
  );
}

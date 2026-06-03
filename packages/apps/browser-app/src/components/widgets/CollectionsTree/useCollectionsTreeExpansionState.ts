import type {
  Collection,
  CollectionCategory,
  CollectionCategoryId,
} from "@superego/backend";
import type { Key } from "react";
import useLocalStorageItem from "../../../business-logic/local-storage/useLocalStorageItem.js";
import WellKnownKey from "../../../business-logic/local-storage/WellKnownKey.js";
import * as tree from "./tree.js";

interface UseCollectionsTreeExpansionState {
  collectionsTree: tree.Tree;
  expandedCollectionCategoryIds: CollectionCategoryId[];
  onExpandedChange: (expandedKeys: Set<Key>) => void;
}

export default function useCollectionsTreeExpansionState(
  collectionCategories: CollectionCategory[],
  collections: Collection[],
  collator: Intl.Collator,
): UseCollectionsTreeExpansionState {
  const [collapsedCollectionCategoryIds, setCollapsedCollectionCategoryIds] =
    useLocalStorageItem<CollectionCategoryId[]>(
      WellKnownKey.CollectionsTreeCollapsedCollectionCategoryIds,
      [],
    );
  const collectionsTree = tree.makeTree(
    collectionCategories,
    collections,
    collator,
  );
  const expandableCollectionCategoryIds = getExpandableCollectionCategoryIds(
    collectionsTree.children,
  );
  const collapsedCollectionCategoryIdSet = new Set(
    collapsedCollectionCategoryIds,
  );
  const expandedCollectionCategoryIds = expandableCollectionCategoryIds.filter(
    (collectionCategoryId) =>
      !collapsedCollectionCategoryIdSet.has(collectionCategoryId),
  );
  return {
    collectionsTree,
    expandedCollectionCategoryIds,
    onExpandedChange: (expandedKeys) =>
      setCollapsedCollectionCategoryIds(
        expandableCollectionCategoryIds.filter(
          (collectionCategoryId) => !expandedKeys.has(collectionCategoryId),
        ),
      ),
  };
}

function getExpandableCollectionCategoryIds(
  items: tree.TreeItem[],
): CollectionCategoryId[] {
  const collectionCategoryIds: CollectionCategoryId[] = [];
  for (const item of items) {
    if (item.type === tree.TreeItemType.CollectionCategory) {
      if (item.children.length > 0) {
        collectionCategoryIds.push(item.id);
      }
      collectionCategoryIds.push(
        ...getExpandableCollectionCategoryIds(item.children),
      );
    }
  }
  return collectionCategoryIds;
}

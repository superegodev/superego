import type {
  Collection,
  CollectionCategory,
  CollectionCategoryId,
  CollectionId,
} from "@superego/backend";
import { groupBy } from "es-toolkit";

export enum TreeItemType {
  CollectionCategory = "CollectionCategory",
  Collection = "Collection",
}

export interface CollectionCategoryTreeItem {
  id: CollectionCategoryId;
  type: TreeItemType.CollectionCategory;
  name: string;
  collectionCategory: CollectionCategory;
  children: TreeItem[];
}

export interface CollectionTreeItem {
  id: CollectionId;
  type: TreeItemType.Collection;
  name: string;
  collection: Collection;
}

export type TreeItem = CollectionCategoryTreeItem | CollectionTreeItem;

export interface Tree {
  children: TreeItem[];
}

export function makeTree(
  collectionCategories: CollectionCategory[],
  collections: Collection[],
  collator: Intl.Collator,
): Tree {
  const collectionCategoriesByParent = groupBy(
    collectionCategories,
    ({ parentId }) => String(parentId),
  );
  const collectionsByCollectionCategory = groupBy(collections, ({ settings }) =>
    String(settings.collectionCategoryId),
  );
  return {
    children: makeChildren(
      collectionCategoriesByParent["null"] ?? [],
      collectionsByCollectionCategory["null"] ?? [],
      collectionCategoriesByParent,
      collectionsByCollectionCategory,
      collator,
    ),
  };
}

function makeCollectionCategoryTreeItem(
  collectionCategory: CollectionCategory,
  collectionCategoriesByParent: Record<string, CollectionCategory[]>,
  collectionsByCollectionCategory: Record<string, Collection[]>,
  collator: Intl.Collator,
): CollectionCategoryTreeItem {
  return {
    id: collectionCategory.id,
    type: TreeItemType.CollectionCategory,
    name: collectionCategory.name,
    collectionCategory: collectionCategory,
    children: makeChildren(
      collectionCategoriesByParent[collectionCategory.id] ?? [],
      collectionsByCollectionCategory[collectionCategory.id] ?? [],
      collectionCategoriesByParent,
      collectionsByCollectionCategory,
      collator,
    ),
  };
}

function makeChildren(
  childCollectionCategories: CollectionCategory[],
  childCollections: Collection[],
  collectionCategoriesByParent: Record<string, CollectionCategory[]>,
  collectionsByCollectionCategory: Record<string, Collection[]>,
  collator: Intl.Collator,
): TreeItem[] {
  const byName = (a: { name: string }, b: { name: string }) =>
    collator.compare(a.name, b.name);
  return [
    ...childCollectionCategories
      .map((childCollectionCategory) =>
        makeCollectionCategoryTreeItem(
          childCollectionCategory,
          collectionCategoriesByParent,
          collectionsByCollectionCategory,
          collator,
        ),
      )
      .sort(byName),
    ...childCollections.map(makeCollectionTreeItem).sort(byName),
  ];
}

function makeCollectionTreeItem(collection: Collection): CollectionTreeItem {
  return {
    id: collection.id,
    type: TreeItemType.Collection,
    name: collection.settings.name,
    collection: collection,
  };
}

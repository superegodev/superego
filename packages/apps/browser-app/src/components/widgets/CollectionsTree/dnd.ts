import type { CollectionCategoryId, CollectionId } from "@superego/backend";
import { createContext, type RefObject, useContext, useRef } from "react";
import { type DragResult, type DropResult, useDrag, useDrop } from "react-aria";

const itemType = "collection-id-or-collection-category-id";

export function useDragTreeItem(
  id: CollectionCategoryId | CollectionId,
  preview: RefObject<any>,
): DragResult {
  return useDrag({ preview, getItems: () => [{ [itemType]: id }] });
}

export function useDropTreeItem(
  id: CollectionCategoryId | CollectionId | null,
  onItemDropped: (
    droppedItemId: CollectionCategoryId | CollectionId,
    droppedOn: CollectionCategoryId | CollectionId | null,
  ) => void,
  isDisabled: boolean,
): DropResult & { ref: RefObject<HTMLDivElement | null> } {
  const ref = useRef<HTMLDivElement | null>(null);
  const dropResult = useDrop({
    ref,
    async onDrop(e) {
      const [item] = e.items;
      if (item && item.kind === "text" && item.types.has(itemType)) {
        const droppedItemId = await item.getText(itemType);
        onItemDropped(droppedItemId as CollectionId | CollectionCategoryId, id);
      }
    },
    isDisabled,
  });
  return { ...dropResult, ref };
}

const IsParentDropDisabledContext = createContext(false);
export const IsParentDropDisabledProvider =
  IsParentDropDisabledContext.Provider;
export function useIsParentDropDisabled(): boolean {
  return useContext(IsParentDropDisabledContext);
}

import type { ContentSummaryProperty } from "@superego/shared-utils";
import type { SortDescriptor } from "react-aria-components";
import type { ColumnIds } from "./useColumnIds.js";

/**
 * Returns:
 * - The first sortable property with a default sort, if there is one.
 * - OR the first sortable property, if there is one.
 * - OR the lastModifiedAt sort descriptor as fallback.
 */
export default function getSortDescriptor(
  properties: ContentSummaryProperty[],
  columnIds: ColumnIds,
): SortDescriptor {
  let firstSortable: ContentSummaryProperty | null = null;
  for (const property of properties) {
    if (firstSortable === null && property.sortable) {
      firstSortable = property;
    }
    if (property.sortable && property.defaultSort !== null) {
      return {
        column: `${columnIds.propertyPrefix}${property.name}`,
        direction: property.defaultSort === "asc" ? "ascending" : "descending",
      };
    }
  }
  return firstSortable
    ? {
        column: `${columnIds.propertyPrefix}${firstSortable.name}`,
        direction: "ascending",
      }
    : { column: columnIds.lastModifiedAt, direction: "descending" };
}

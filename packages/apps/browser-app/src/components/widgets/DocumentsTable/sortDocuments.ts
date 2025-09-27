import type { LiteDocument } from "@superego/backend";
import type { SortDescriptor } from "react-aria-components";
import type { ColumnIds } from "./useColumnIds.js";

export default function sortDocuments(
  documents: LiteDocument[],
  sortDescriptor: SortDescriptor,
  columnIds: ColumnIds,
): LiteDocument[] {
  const direction = sortDescriptor.direction === "ascending" ? 1 : -1;
  return documents.toSorted((a, b) => {
    const aValue = getSortableProperty(a, sortDescriptor, columnIds);
    const bValue = getSortableProperty(b, sortDescriptor, columnIds);
    if (bValue === null || bValue === undefined) {
      return direction;
    }
    if (aValue === null || aValue === undefined) {
      return -direction;
    }
    if (typeof aValue !== typeof bValue) {
      return typeof aValue === "string"
        ? direction
        : typeof bValue === "string"
          ? -direction
          : direction;
    }
    return aValue > bValue ? direction : -direction;
  });
}

function getSortableProperty(
  document: LiteDocument,
  sortDescriptor: SortDescriptor,
  columnIds: ColumnIds,
) {
  if (sortDescriptor.column === columnIds.createdAt) {
    return document.createdAt.getTime();
  }
  if (sortDescriptor.column === columnIds.lastModifiedAt) {
    return document.latestVersion.createdAt.getTime();
  }
  const propertyName = (sortDescriptor.column as string).slice(
    columnIds.propertyPrefix.length,
  );
  const propertyValue = document.latestVersion.contentSummary.success
    ? document.latestVersion.contentSummary.data[propertyName]
    : null;

  return propertyValue;
}

import type { LiteDocument } from "@superego/backend";
import type { SortDescriptor } from "react-aria-components";
import type { SortableColumnIds } from "./useSortableColumnIds.js";

export default function sortDocuments(
  documents: LiteDocument[],
  sortDescriptor: SortDescriptor,
  sortableColumnIds: SortableColumnIds,
): LiteDocument[] {
  const direction = sortDescriptor.direction === "ascending" ? 1 : -1;
  return documents.toSorted((a, b) => {
    const aValue = getSortableProperty(a, sortDescriptor, sortableColumnIds);
    const bValue = getSortableProperty(b, sortDescriptor, sortableColumnIds);
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
  sortableColumnIds: SortableColumnIds,
) {
  if (sortDescriptor.column === sortableColumnIds.createdAt) {
    return document.createdAt.getTime();
  }
  if (sortDescriptor.column === sortableColumnIds.lastModifiedAt) {
    return document.latestVersion.createdAt.getTime();
  }
  const propertyName = (sortDescriptor.column as string).slice(
    sortableColumnIds.propertyPrefix.length,
  );
  const propertyValue = document.latestVersion.contentSummary.success
    ? document.latestVersion.contentSummary.data[propertyName]
    : null;

  return propertyValue;
}

import type { DocumentVersion } from "@superego/backend";
import { uniq } from "es-toolkit";
import type ContentSummaryProperty from "./ContentSummaryProperty.js";

const POSITION_KEY = "position";
const SORTABLE_KEY = "sortable";
const DEFAULT_SORT_KEY = "default-sort";

function parsePropertyName(propertyName: string): ContentSummaryProperty {
  const defaultResult: ContentSummaryProperty = {
    name: propertyName,
    label: propertyName,
    position: 999,
    sortable: false,
    defaultSort: null,
  };

  if (!propertyName.startsWith("{")) {
    return defaultResult;
  }

  const closingBraceIndex = propertyName.indexOf("}");
  if (closingBraceIndex === -1) {
    return defaultResult;
  }

  const prefixContent = propertyName.slice(1, closingBraceIndex);
  const result: ContentSummaryProperty = {
    ...defaultResult,
    label: propertyName.slice(closingBraceIndex + 1).trim(),
  };

  const segments = prefixContent.length === 0 ? [] : prefixContent.split(",");
  for (const rawSegment of segments) {
    const segment = rawSegment.trim();
    if (segment.length === 0) {
      return defaultResult;
    }

    const colonIndex = segment.indexOf(":");
    if (colonIndex === -1) {
      return defaultResult;
    }

    const attributeName = segment.slice(0, colonIndex).trim();
    const attributeValue = segment.slice(colonIndex + 1).trim();

    if (attributeName.length === 0 || attributeValue.length === 0) {
      return defaultResult;
    }

    switch (attributeName) {
      case POSITION_KEY: {
        if (/^-?\d+$/.test(attributeValue)) {
          result.position = Number.parseInt(attributeValue, 10);
          break;
        }
        return defaultResult;
      }
      case SORTABLE_KEY: {
        if (attributeValue === "true" || attributeValue === "false") {
          result.sortable = attributeValue === "true";
          break;
        }
        return defaultResult;
      }
      case DEFAULT_SORT_KEY: {
        if (attributeValue === "asc" || attributeValue === "desc") {
          result.defaultSort = attributeValue;
          break;
        }
        return defaultResult;
      }
      default: {
        return defaultResult;
      }
    }
  }

  return result;
}

function getSortedProperties(
  contentSummaries: DocumentVersion["contentSummary"][],
): ContentSummaryProperty[] {
  return uniq(
    contentSummaries.flatMap((contentSummary) =>
      Object.keys(contentSummary.data ?? {}),
    ),
  )
    .map(parsePropertyName)
    .sort((a, b) => (a.position >= b.position ? 1 : -1));
}

export default { parsePropertyName, getSortedProperties };

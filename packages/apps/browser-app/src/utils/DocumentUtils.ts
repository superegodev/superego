import type { Document } from "@superego/backend";
import { ContentSummaryUtils } from "@superego/shared-utils";
import { head } from "es-toolkit";

export default {
  getDisplayName(document: Document): string {
    const { contentSummary } = document.latestVersion;
    if (!contentSummary.success) {
      return document.id;
    }
    const firstContentSummaryProperty = head(
      ContentSummaryUtils.getSortedProperties([contentSummary]),
    );
    return firstContentSummaryProperty
      ? contentSummary.data[firstContentSummaryProperty.name]!
      : document.id;
  },
};

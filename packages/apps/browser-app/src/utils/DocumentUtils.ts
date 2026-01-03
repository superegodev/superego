import type { LiteDocument } from "@superego/backend";
import { ContentSummaryUtils } from "@superego/shared-utils";
import { head } from "es-toolkit";

export default {
  getDisplayName(document: LiteDocument): string {
    const { contentSummary } = document.latestVersion;
    if (!contentSummary.success) {
      return document.id;
    }
    const firstContentSummaryProperty = head(
      ContentSummaryUtils.getSortedProperties([contentSummary]),
    );
    if (!firstContentSummaryProperty) {
      return document.id;
    }
    const value = contentSummary.data[firstContentSummaryProperty.name];
    return value !== undefined && value !== null ? String(value) : document.id;
  },
};

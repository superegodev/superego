import type { Document } from "@superego/backend";
import { head } from "es-toolkit";

export default {
  getDisplayName(document: Document): string {
    const { contentSummary } = document.latestVersion;
    return contentSummary.success
      ? (head(Object.values(contentSummary.data)) ?? document.id)
      : document.id;
  },

  formatContentSummaryKey(key: string): string {
    return key.replace(/^\d+\.\s+/, "");
  },
};

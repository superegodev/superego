import type { Document } from "@superego/backend";

export default {
  getDisplayName(document: Document): string {
    return document.latestVersion.summaryProperties[0].value ?? document.id;
  },
};

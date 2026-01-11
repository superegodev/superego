import type { MinimalDocumentVersion } from "@superego/backend";

export default interface Bucket {
  id: string;
  documentVersions: MinimalDocumentVersion[];
  startDate: Date;
  endDate: Date;
}

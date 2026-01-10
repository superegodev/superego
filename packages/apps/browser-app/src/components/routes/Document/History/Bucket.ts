import type { LiteDocumentVersion } from "@superego/backend";

export default interface Bucket {
  id: string;
  documentVersions: LiteDocumentVersion[];
  startDate: Date;
  endDate: Date;
}

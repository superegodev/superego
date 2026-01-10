import type { LiteDocumentVersion } from "@superego/backend";
import type Bucket from "./Bucket.js";

type TimelineNode = LiteDocumentVersion | Bucket;
export default TimelineNode;

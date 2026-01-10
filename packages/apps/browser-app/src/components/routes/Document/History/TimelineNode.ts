import type { MinimalDocumentVersion } from "@superego/backend";
import type Bucket from "./Bucket.js";

type TimelineNode = MinimalDocumentVersion | Bucket;
export default TimelineNode;

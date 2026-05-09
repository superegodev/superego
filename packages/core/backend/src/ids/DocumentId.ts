import * as v from "valibot";
import { idPattern } from "./_internal/idPattern.js";

type DocumentId = `Document_${string}`;
const DocumentIdSchema = v.pipe(
  v.string(),
  v.regex(idPattern("Document")),
) as v.GenericSchema<DocumentId, DocumentId>;
export default DocumentIdSchema;
export type { DocumentId };

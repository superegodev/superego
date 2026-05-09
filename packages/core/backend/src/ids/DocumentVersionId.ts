import * as v from "valibot";
import { idPattern } from "./_internal/idPattern.js";

type DocumentVersionId = `DocumentVersion_${string}`;
const DocumentVersionIdSchema = v.pipe(
  v.string(),
  v.regex(idPattern("DocumentVersion")),
) as v.GenericSchema<DocumentVersionId, DocumentVersionId>;
export default DocumentVersionIdSchema;
export type { DocumentVersionId };

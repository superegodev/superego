import * as v from "valibot";
import { omitEntries } from "../contracts/objectUtils.js";
import DocumentVersionSchema from "./DocumentVersion.js";

const LiteDocumentVersionSchema = v.object(
  omitEntries(DocumentVersionSchema.entries, ["content"]),
);
export default LiteDocumentVersionSchema;
export type LiteDocumentVersion = v.InferOutput<
  typeof LiteDocumentVersionSchema
>;

import * as v from "valibot";
import { omitEntries } from "../contracts/objectUtils.js";
import DocumentVersionSchema from "./DocumentVersion.js";

const MinimalDocumentVersionSchema = v.object(
  omitEntries(DocumentVersionSchema.entries, ["content", "contentSummary"]),
);
export default MinimalDocumentVersionSchema;
export type MinimalDocumentVersion = v.InferOutput<
  typeof MinimalDocumentVersionSchema
>;

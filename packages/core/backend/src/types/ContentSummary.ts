import * as v from "valibot";

const ContentSummarySchema = v.record(
  v.string(),
  v.union([v.string(), v.number(), v.boolean(), v.null()]),
);
export default ContentSummarySchema;
export type ContentSummary = v.InferOutput<typeof ContentSummarySchema>;

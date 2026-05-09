import * as v from "valibot";

const ValidationIssueSchema = v.object({
  message: v.string(),
  path: v.optional(
    v.array(v.object({ key: v.union([v.string(), v.number()]) })),
  ),
});
export default ValidationIssueSchema;
export type ValidationIssue = v.InferOutput<typeof ValidationIssueSchema>;

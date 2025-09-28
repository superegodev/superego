import * as v from "valibot";

export default function contentSummary() {
  return v.record(
    v.string(),
    v.union([v.string(), v.number(), v.nan(), v.boolean(), v.null()]),
  );
}

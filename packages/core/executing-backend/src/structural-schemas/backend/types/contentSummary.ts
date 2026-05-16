import type { ContentSummary } from "@superego/backend";
import * as v from "valibot";

export function contentSummary(): v.GenericSchema<unknown, ContentSummary> {
  return v.record(
    v.string(),
    v.union([v.string(), v.number(), v.boolean(), v.null()]),
  ) as v.GenericSchema<unknown, ContentSummary>;
}

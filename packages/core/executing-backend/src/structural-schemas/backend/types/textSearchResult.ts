import type { TextSearchResult } from "@superego/backend";
import * as v from "valibot";

export function textSearchResult<Match>(
  matchSchema: v.GenericSchema<unknown, Match>,
): v.GenericSchema<unknown, TextSearchResult<Match>> {
  return v.strictObject({
    match: matchSchema,
    matchedText: v.string(),
  });
}

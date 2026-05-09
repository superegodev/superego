import * as v from "valibot";

/**
 * Schema factory for `TextSearchResult<Match>`. Pass the schema for the
 * matched item.
 */
export function textSearchResultSchema<MatchSchema extends v.GenericSchema>(
  matchSchema: MatchSchema,
): v.GenericSchema<TextSearchResult<v.InferOutput<MatchSchema>>> {
  return v.object({
    match: matchSchema,
    matchedText: v.string(),
  }) as any;
}

interface TextSearchResult<Match> {
  match: Match;
  matchedText: string;
}
export default TextSearchResult;

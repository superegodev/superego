import type { ReactNode } from "react";
import * as cs from "./MatchedText.css.js";
import parseMatchedText from "./parseMatchedText.js";

interface Props {
  matchedText: string;
}
export default function MatchedText({ matchedText }: Props): ReactNode {
  const segments = parseMatchedText(matchedText);
  return (
    <span>
      {segments.map((segment, index) =>
        segment.isHighlighted ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: no other key fits.
          <mark key={index} className={cs.MatchedText.mark}>
            {segment.text}
          </mark>
        ) : (
          segment.text
        ),
      )}
    </span>
  );
}

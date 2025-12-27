import type { ReactNode } from "react";
import * as cs from "./HighlightedText.css.js";

interface Props {
  text: string;
  className?: string | undefined;
}

interface TextSegment {
  text: string;
  isHighlighted: boolean;
}

function parseHighlightedText(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const regex = /«([^»]*)»/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        isHighlighted: false,
      });
    }

    // Add the highlighted match
    segments.push({
      text: match[1]!,
      isHighlighted: true,
    });

    lastIndex = regex.lastIndex;
  }

  // Add remaining text after the last match
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      isHighlighted: false,
    });
  }

  return segments;
}

export default function HighlightedText({ text, className }: Props): ReactNode {
  const segments = parseHighlightedText(text);

  return (
    <span className={className}>
      {segments.map((segment, index) =>
        segment.isHighlighted ? (
          <mark key={index} className={cs.HighlightedText.mark}>
            {segment.text}
          </mark>
        ) : (
          segment.text
        ),
      )}
    </span>
  );
}

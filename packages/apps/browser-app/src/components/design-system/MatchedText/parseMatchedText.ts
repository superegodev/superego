interface TextSegment {
  text: string;
  isHighlighted: boolean;
}

export default function parseMatchedText(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const regex = /«([^»]*)»/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null = regex.exec(text);

  while (match !== null) {
    // Add text before the match.
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        isHighlighted: false,
      });
    }

    // Add the highlighted match.
    segments.push({
      text: match[1]!,
      isHighlighted: true,
    });

    lastIndex = regex.lastIndex;
    match = regex.exec(text);
  }

  // Add remaining text after the last match.
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      isHighlighted: false,
    });
  }

  return segments;
}

import type { ReactNode } from "react";
import InlineCode from "../components/design-system/InlineCode/InlineCode.js";

type Chunks = ReactNode[];

export default {
  b: (chunks: Chunks) => <strong>{chunks}</strong>,
  i: (chunks: Chunks) => <em>{chunks}</em>,
  a: (chunks: Chunks) => (
    <a
      href={(chunks as string[]).join("")}
      target="_blank"
      rel="noopener noreferrer"
    >
      {(chunks as string[]).join("")}
    </a>
  ),
  p: (chunks: Chunks) => <p>{chunks}</p>,
  ul: (chunks: Chunks) => <ul>{chunks}</ul>,
  ol: (chunks: Chunks) => <ol>{chunks}</ol>,
  li: (chunks: Chunks) => <li>{chunks}</li>,
  code: (chunks: Chunks) => <InlineCode>{chunks}</InlineCode>,
};

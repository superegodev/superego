import type { ReactNode } from "react";
import InlineCode from "../components/design-system/InlineCode/InlineCode.js";

type Chunks = ReactNode[];

export default {
  // Hack to avoid React 19 key errors, due to a react-intl bug. Follow
  // https://github.com/formatjs/formatjs/pull/5032 for updates. When solved,
  // remove the keys.
  b: (chunks: Chunks) => (
    <strong key={(chunks as string[]).join("")}>{chunks}</strong>
  ),
  i: (chunks: Chunks) => <em key={(chunks as string[]).join("")}>{chunks}</em>,
  a: (chunks: Chunks) => (
    <a
      key={(chunks as string[]).join("")}
      href={(chunks as string[]).join("")}
      target="_blank"
    >
      {(chunks as string[]).join("")}
    </a>
  ),
  p: (chunks: Chunks) => <p key={(chunks as string[]).join("")}>{chunks}</p>,
  code: (chunks: Chunks) => (
    <InlineCode key={(chunks as string[]).join("")}>{chunks}</InlineCode>
  ),
};

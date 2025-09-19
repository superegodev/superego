import type { ReactNode } from "react";
import InlineCode from "../components/design-system/InlineCode/InlineCode.jsx";

type Chunks = ReactNode[];

export default {
  // Hack to avoid React 19 key errors. Should be solved in the next version of
  // react-intl. At that point, remove the keys.
  b: (chunks: Chunks) => <b key={(chunks as string[])[0]}>{chunks}</b>,
  p: (chunks: Chunks) => <p key={(chunks as string[])[0]}>{chunks}</p>,
  code: (chunks: Chunks) => (
    <InlineCode key={(chunks as string[])[0]}>{chunks}</InlineCode>
  ),
};

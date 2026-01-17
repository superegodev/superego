import MarkdownMTJ, { type MarkdownToJSX } from "markdown-to-jsx";
import {
  type AnchorHTMLAttributes,
  type TableHTMLAttributes,
  useMemo,
} from "react";
import classnames from "../../../utils/classnames.js";
import Link from "../Link/Link.js";
import * as cs from "./Markdown.css.js";

interface Props {
  text: string;
  overrides?: MarkdownToJSX.Overrides;
  className?: string | undefined;
}
export default function Markdown({ text, overrides, className }: Props) {
  const options = useMemo(
    () => ({
      ...baseOptions,
      overrides: { ...baseOptions.overrides, ...overrides },
    }),
    [overrides],
  );
  return (
    <MarkdownMTJ
      key={text}
      className={classnames(cs.Markdown.root, className)}
      options={options}
    >
      {text}
    </MarkdownMTJ>
  );
}

const baseOptions: MarkdownToJSX.Options = {
  wrapper: "div",
  forceWrapper: true,
  overrides: {
    iframe: () => null,

    a: ({ href, children }: AnchorHTMLAttributes<HTMLAnchorElement>) =>
      href?.startsWith("/") && href ? (
        <Link href={href}>{children}</Link>
      ) : (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ),

    table: (props: TableHTMLAttributes<HTMLTableElement>) => (
      <div className={cs.Markdown.tableScroller}>
        <table {...props} />
      </div>
    ),
  },
};

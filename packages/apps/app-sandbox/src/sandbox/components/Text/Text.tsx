import type { CSSProperties, ReactNode } from "react";
import { vars } from "../../themes.css.js";

const elementsByWeight = {
  regular: new Set(["span", "p", "h5", "h6"]),
  semibold: new Set(["h3", "h4"]),
  bold: new Set(["h1", "h2"]),
};

interface Props {
  /** Defaults to span. */
  element?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | undefined;
  /** Defaults to primary. */
  color?: "primary" | "secondary" | undefined;
  /** Default varies according to element. */
  size?:
    | "xs2"
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "xl2"
    | "xl3"
    | "xl4"
    | undefined;
  /** Default varies according to element. */
  weight?: "light" | "regular" | "medium" | "semibold" | "bold" | undefined;
  /** Defaults to sans-serif. */
  font?: "sansSerif" | "serif" | "monospace" | undefined;
  style?: CSSProperties | undefined;
  children: ReactNode;
}
export default function Text({
  element = "span",
  color = "primary",
  size = element === "h1"
    ? "xl3"
    : element === "h2"
      ? "xl2"
      : element === "h3"
        ? "xl"
        : element === "h4"
          ? "lg"
          : element === "h5"
            ? "lg"
            : "md",
  weight = elementsByWeight.regular.has(element)
    ? "regular"
    : elementsByWeight.semibold.has(element)
      ? "semibold"
      : "bold",
  font = "sansSerif",
  style,
  children,
}: Props) {
  const Element = element;
  return (
    <Element
      style={{
        color: vars.colors.text[color],
        fontSize: vars.typography.fontSizes[size],
        fontWeight: vars.typography.fontWeights[weight],
        fontFamily: vars.typography.fontFamilies[font],
        ...style,
      }}
    >
      {children}
    </Element>
  );
}

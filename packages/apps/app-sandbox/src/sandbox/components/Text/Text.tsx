import type { CSSProperties, ReactNode } from "react";
import { vars } from "../../themes.css.js";

interface Props {
  /** Defaults to span. */
  element?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | undefined;
  /** Defaults to primary. */
  color?: "primary" | "secondary" | undefined;
  /** Defaults to sm. */
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
  /** Defaults to regular. */
  weight?: "light" | "regular" | "medium" | "semibold" | "bold" | undefined;
  /** Defaults to sans-serif. */
  font?: "sansSerif" | "serif" | "monospace" | undefined;
  style?: CSSProperties | undefined;
  children: ReactNode;
}
export default function Text({
  element,
  color,
  size,
  weight,
  font,
  style,
  children,
}: Props) {
  const Element = element ?? "span";
  return (
    <Element
      style={{
        color: vars.colors.text[color ?? "primary"],
        fontSize: vars.typography.fontSizes[size ?? "sm"],
        fontWeight: vars.typography.fontWeights[weight ?? "regular"],
        fontFamily: vars.typography.fontFamilies[font ?? "sansSerif"],
        ...style,
      }}
    >
      {children}
    </Element>
  );
}

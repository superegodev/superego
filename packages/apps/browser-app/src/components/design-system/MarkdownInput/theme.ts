import type { Theme } from "overtype";
import { vars } from "../../../themes.css.js";

export default {
  name: "superego",
  colors: {
    // Backgrounds
    bgPrimary: vars.colors.background.secondarySurface,
    bgSecondary: vars.colors.background.surface,

    // Text
    text: vars.colors.text.primary,
    textPrimary: vars.colors.text.primary,
    textSecondary: vars.colors.text.secondary,

    // Headings
    h1: vars.colors.blues._5,
    h2: vars.colors.blues._5,
    h3: vars.colors.blues._5,

    // Inline formatting
    strong: vars.colors.blues._5,
    em: vars.colors.text.primary,
    del: vars.colors.text.secondary,
    code: vars.colors.accent,
    codeBg: vars.colors.background.surface,

    // Links
    link: vars.colors.blues._5,

    // Blocks
    blockquote: vars.colors.text.secondary,
    hr: vars.colors.blues._5,
    listMarker: vars.colors.blues._5,

    // Syntax / markers
    syntaxMarker: vars.colors.blues._5,
    syntax: vars.colors.blues._5,
    rawLine: vars.colors.text.secondary,

    // Interactive
    cursor: vars.colors.text.primary,
    selection: `color-mix(in srgb, ${vars.colors.oranges._5} 20%, transparent)`,
    border: vars.colors.border.default,
    hoverBg: vars.colors.background.surfaceHighlight,
    primary: vars.colors.text.primary,
  },
} satisfies Theme;

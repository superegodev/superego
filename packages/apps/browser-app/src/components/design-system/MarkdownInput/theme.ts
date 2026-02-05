import type { Theme } from "overtype";
import { vars } from "../../../themes.css.js";

/**
 * OverType theme that maps to Superego's design tokens via CSS custom
 * properties.  Because the values are `var(--…)` references they resolve
 * automatically when the page switches between light and dark mode.
 */
const theme: Theme = {
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
    h1: vars.colors.accent,
    h2: vars.colors.oranges._3,
    h3: vars.colors.greens._4,

    // Inline formatting
    strong: vars.colors.accent,
    em: vars.colors.reds._4,
    del: vars.colors.text.secondary,
    code: vars.colors.text.primary,
    codeBg: vars.colors.oranges._1,

    // Links
    link: vars.colors.blues._4,

    // Blocks
    blockquote: vars.colors.text.secondary,
    hr: vars.colors.border.default,
    listMarker: vars.colors.accent,

    // Syntax / markers
    syntaxMarker: vars.colors.text.secondary,
    syntax: vars.colors.text.secondary,
    rawLine: vars.colors.text.secondary,

    // Interactive
    cursor: vars.colors.accent,
    selection: vars.colors.oranges._1,
    border: vars.colors.border.default,
    hoverBg: vars.colors.background.surfaceHighlight,
    primary: vars.colors.text.primary,

    // Toolbar (unused — we render our own, but kept for completeness)
    toolbarBg: vars.colors.background.surface,
    toolbarIcon: vars.colors.text.primary,
    toolbarHover: vars.colors.background.surfaceHighlight,
    toolbarActive: vars.colors.background.secondarySurface,
    toolbarBorder: vars.colors.border.default,
  },
};

export default theme;

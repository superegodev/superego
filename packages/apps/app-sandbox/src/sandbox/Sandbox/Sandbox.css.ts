import { globalStyle } from "@vanilla-extract/css";
import { vars } from "../themes.css.js";

globalStyle("*", {
  boxSizing: "border-box",
});

globalStyle("html, body", {
  position: "relative",
  height: "100dvh",
  margin: 0,
  padding: 0,
  fontFamily: vars.typography.fontFamilies.sansSerif,
  fontSize: vars.typography.fontSizes.md,
  color: vars.colors.text.primary,
  background: vars.colors.background.surface,
});

// Replicates the "scroll fade" of the panel header.
globalStyle("body::before", {
  content: '""',
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: "0.6rem",
  background: `linear-gradient(180deg, ${vars.colors.background.surface} 0%, rgba(from ${vars.colors.background.surface} r g b / 0) 100%)`,
  zIndex: 99,
  pointerEvents: "none",
});

globalStyle("#root", {
  display: "grid",
  minHeight: "100%",
  minWidth: "100%",
  padding: vars.spacing._8,
  paddingBlockStart: vars.spacing._4,
});

globalStyle("*:focus-visible", {
  outline: "none",
});
globalStyle('*:focus-visible[data-focus-visible="true"]', {
  outline: `2px solid ${vars.colors.accent}`,
  outlineOffset: "-2px",
});

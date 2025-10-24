import { globalStyle } from "@vanilla-extract/css";
import { vars } from "../themes.css.js";

globalStyle("html, body", {
  margin: 0,
  fontFamily: vars.typography.fontFamilies.sansSerif,
  fontSize: vars.typography.fontSizes.sm,
  color: vars.colors.text.primary,
  background: vars.colors.background.surface,
});

globalStyle("*", {
  boxSizing: "border-box",
});

globalStyle("*:focus-visible", {
  outline: "none",
});
globalStyle('*:focus-visible[data-focus-visible="true"]', {
  outline: `2px solid ${vars.colors.accent}`,
  outlineOffset: "-2px",
});

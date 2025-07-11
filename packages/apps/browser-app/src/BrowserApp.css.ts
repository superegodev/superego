import { globalStyle } from "@vanilla-extract/css";
import { vars } from "./themes.css.js";

globalStyle("html, body", {
  margin: 0,
  fontFamily: vars.typography.fontFamilies.sansSerif,
});

globalStyle("*", {
  boxSizing: "border-box",
});

globalStyle("*:focus-visible", {
  outline: `2px solid ${vars.colors.accent}`,
  outlineOffset: "-2px",
});

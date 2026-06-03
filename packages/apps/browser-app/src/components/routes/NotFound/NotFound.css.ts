import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const NotFound = {
  root: style({
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: vars.spacing._4,
    maxWidth: "40rem",
  }),

  message: style({
    margin: 0,
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.md,
    lineHeight: vars.typography.lineHeights.relaxed,
  }),
};

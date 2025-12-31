import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const MatchedText = {
  mark: style({
    background: "transparent",
    fontWeight: vars.typography.fontWeights.bold,
    borderRadius: vars.borders.radius.sm,
  }),
};

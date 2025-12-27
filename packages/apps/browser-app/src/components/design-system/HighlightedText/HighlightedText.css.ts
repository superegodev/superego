import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const HighlightedText = {
  mark: style({
    background: `rgb(from ${vars.colors.accent} r g b / 0.25)`,
    borderRadius: vars.borders.radius.sm,
    paddingInline: vars.spacing._0_5,
    color: "inherit",
  }),
};

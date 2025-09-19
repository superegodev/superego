import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const InlineCode = {
  root: style({
    borderRadius: vars.borders.radius.md,
    background: vars.colors.background.surfaceHighlight,
    paddingInline: vars.spacing._1,
    fontFamily: vars.typography.fontFamilies.monospace,
    fontSize: "smaller",
    fontStyle: "normal",
  }),
};

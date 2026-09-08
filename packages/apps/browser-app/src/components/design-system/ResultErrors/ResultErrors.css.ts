import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const ResultErrors = {
  details: style({
    maxHeight: vars.spacing._64,
    overflow: "auto",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    fontFamily: vars.typography.fontFamilies.monospace,
    fontSize: vars.typography.fontSizes.md,
  }),
};

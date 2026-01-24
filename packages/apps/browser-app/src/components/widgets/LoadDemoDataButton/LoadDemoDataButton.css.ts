import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const LoadDemoDataButton = {
  button: style({
    fontSize: vars.typography.fontSizes.md,
    padding: vars.spacing._0_5,
    marginBlockEnd: vars.spacing._3,
  }),

  modal: style({
    width: vars.spacing._120,
  }),

  progressBar: style({
    marginBlockEnd: vars.spacing._2,
  }),
};

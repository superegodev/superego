import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const LoadDemoDataButton = {
  button: style({
    fontSize: vars.typography.fontSizes.sm,
    padding: vars.spacing._0_5,
    marginBlockEnd: vars.spacing._3,
  }),
};

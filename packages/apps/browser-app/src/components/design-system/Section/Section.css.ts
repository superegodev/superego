import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const Section = {
  root: style({
    marginBlockEnd: vars.spacing._8,
  }),
  title: style({
    paddingBlockEnd: vars.spacing._2,
    marginBlockEnd: vars.spacing._8,
    borderBlockEnd: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    fontSize: vars.typography.fontSizes.lg,
    fontWeight: vars.typography.fontWeights.regular,
  }),
};

import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const PackName = {
  root: style({
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._4,
    fontSize: vars.typography.fontSizes.lg,
    fontWeight: vars.typography.fontWeights.medium,
  }),

  packId: style({
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.md,
    fontWeight: vars.typography.fontWeights.regular,
  }),
};

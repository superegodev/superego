import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const MenuItem = {
  root: style({
    padding: vars.spacing._2,
    cursor: "default",
    borderRadius: vars.borders.radius.md,
    color: vars.colors.text.primary,
    fontSize: vars.typography.fontSizes.sm,
    selectors: {
      '&:hover:not([data-disabled="true"])': {
        background: vars.colors.background.surfaceHighlight,
      },
      '&[data-disabled="true"]': {
        color: vars.colors.text.secondary,
        cursor: "not-allowed",
      },
    },
  }),
};

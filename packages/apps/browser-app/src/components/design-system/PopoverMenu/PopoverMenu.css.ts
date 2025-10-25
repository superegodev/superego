import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const Menu = {
  root: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._1,
  }),
};

export const MenuItem = {
  root: style({
    display: "block",
    padding: vars.spacing._2,
    cursor: "default",
    borderRadius: vars.borders.radius.md,
    color: vars.colors.text.primary,
    fontSize: vars.typography.fontSizes.sm,
    textDecoration: "none",
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

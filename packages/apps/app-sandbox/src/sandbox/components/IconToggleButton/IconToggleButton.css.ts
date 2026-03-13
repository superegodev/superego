import { style } from "@vanilla-extract/css";
import { vars } from "../../themes.css.js";

export const iconToggleButtonRoot = style({
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  padding: vars.spacing._1,
  borderRadius: vars.borders.radius.md,
  fontSize: vars.typography.fontSizes.md,
  cursor: "pointer",
  background: vars.colors.button.invisible.base.background,
  color: vars.colors.button.invisible.base.text,
  borderColor: vars.colors.button.invisible.base.border,
  borderWidth: vars.borders.width.thin,
  borderStyle: "solid",
  selectors: {
    "&:hover": {
      background: vars.colors.button.invisible.hover.background,
      color: vars.colors.button.invisible.hover.text,
    },
    "&[disabled]": {
      cursor: "not-allowed",
      background: vars.colors.button.invisible.disabled.background,
      color: vars.colors.button.invisible.disabled.text,
    },
    '&[data-selected="true"]': {
      background: vars.colors.button.primary.base.background,
      color: vars.colors.button.primary.base.text,
      borderColor: vars.colors.button.primary.base.border,
    },
    '&[data-selected="true"]:hover': {
      background: vars.colors.button.primary.hover.background,
      color: vars.colors.button.primary.hover.text,
      borderColor: vars.colors.button.primary.hover.border,
    },
    '&[data-selected="true"]:disabled': {
      background: vars.colors.button.primary.disabled.background,
      color: vars.colors.button.primary.disabled.text,
      borderColor: vars.colors.button.primary.disabled.border,
    },
  },
});

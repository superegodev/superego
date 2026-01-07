import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../themes.css.js";

const iconButtonRootBase = style({
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  padding: vars.spacing._1,
  borderRadius: vars.borders.radius.md,
  color: vars.colors.text.primary,
  cursor: "pointer",
  selectors: {
    "&[disabled]": {
      cursor: "not-allowed",
    },
  },
});

export const IconButton = {
  root: styleVariants({
    // Base visual style
    default: [
      iconButtonRootBase,
      {
        background: vars.colors.button.default.base.background,
        color: vars.colors.button.default.base.text,
        borderColor: vars.colors.button.default.base.border,
        borderWidth: vars.borders.width.thin,
        borderStyle: "solid",
        selectors: {
          "&:hover": {
            background: vars.colors.button.default.hover.background,
            color: vars.colors.button.default.hover.text,
            borderColor: vars.colors.button.default.hover.border,
          },
          "&[disabled]": {
            background: vars.colors.button.default.disabled.background,
            color: vars.colors.button.default.disabled.text,
            borderColor: vars.colors.button.default.disabled.border,
          },
        },
      },
    ],
    primary: [
      iconButtonRootBase,
      {
        background: vars.colors.button.primary.base.background,
        color: vars.colors.button.primary.base.text,
        borderColor: vars.colors.button.primary.base.border,
        borderWidth: vars.borders.width.thin,
        borderStyle: "solid",
        selectors: {
          "&:hover": {
            background: vars.colors.button.primary.hover.background,
            color: vars.colors.button.primary.hover.text,
            borderColor: vars.colors.button.primary.hover.border,
          },
          "&[disabled]": {
            background: vars.colors.button.primary.disabled.background,
            color: vars.colors.button.primary.disabled.text,
            borderColor: vars.colors.button.primary.disabled.border,
          },
        },
      },
    ],
    invisible: [
      iconButtonRootBase,
      {
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
            background: vars.colors.button.invisible.disabled.background,
            color: vars.colors.button.invisible.disabled.text,
          },
        },
      },
    ],
    // Sizes
    sm: {
      height: `calc(${vars.spacing._7} + 2 * ${vars.borders.width.thin})`,
      width: `calc(${vars.spacing._7} + 2 * ${vars.borders.width.thin})`,
      fontSize: vars.typography.fontSizes.sm,
    },
    md: {
      height: `calc(${vars.spacing._9} + 2 * ${vars.borders.width.thin})`,
      width: `calc(${vars.spacing._9} + 2 * ${vars.borders.width.thin})`,
      fontSize: vars.typography.fontSizes.md,
    },
    lg: {
      height: `calc(${vars.spacing._10} + 2 * ${vars.borders.width.thin})`,
      width: `calc(${vars.spacing._10} + 2 * ${vars.borders.width.thin})`,
      fontSize: vars.typography.fontSizes.lg,
    },
  }),
};

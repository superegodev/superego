import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../themes.css.js";

const buttonRootBase = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  paddingInline: vars.spacing._3,
  borderRadius: vars.borders.radius.md,
  cursor: "pointer",
  selectors: {
    "&[disabled]": {
      cursor: "not-allowed",
    },
  },
});

export const Button = {
  root: styleVariants({
    // Base visual style
    default: [
      buttonRootBase,
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
      buttonRootBase,
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
      buttonRootBase,
      {
        background: vars.colors.button.invisible.base.background,
        color: vars.colors.button.invisible.base.text,
        border: 0,
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
    danger: [
      buttonRootBase,
      {
        background: vars.colors.button.danger.base.background,
        color: vars.colors.button.danger.base.text,
        borderColor: vars.colors.button.danger.base.border,
        borderWidth: vars.borders.width.thin,
        borderStyle: "solid",
        selectors: {
          "&:hover": {
            background: vars.colors.button.danger.hover.background,
            color: vars.colors.button.danger.hover.text,
            borderColor: vars.colors.button.danger.hover.border,
            fontWeight: vars.typography.fontWeights.medium,
          },
          "&[disabled]": {
            background: vars.colors.button.danger.disabled.background,
            color: vars.colors.button.danger.disabled.text,
            borderColor: vars.colors.button.danger.disabled.border,
          },
        },
      },
    ],
    // Sizes
    sm: {
      height: `calc(${vars.spacing._7} + 2 * ${vars.borders.width.thin})`,
      fontSize: vars.typography.fontSizes.sm,
    },
    md: {
      height: `calc(${vars.spacing._9} + 2 * ${vars.borders.width.thin})`,
      fontSize: vars.typography.fontSizes.md,
    },
    lg: {
      height: `calc(${vars.spacing._10} + 2 * ${vars.borders.width.thin})`,
      fontSize: vars.typography.fontSizes.lg,
    },
  }),
};

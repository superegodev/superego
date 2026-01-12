import { createVar, style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../themes.css.js";

export const baseColorVar = createVar();

const toggleButtonRootBase = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  paddingInline: vars.spacing._3,
  borderRadius: vars.borders.radius.md,
  cursor: "pointer",
  vars: {
    [baseColorVar]: vars.colors.button.primary.base.background,
  },
  selectors: {
    "&[disabled]": {
      cursor: "not-allowed",
    },
  },
});

export const ToggleButton = {
  root: styleVariants({
    notSelected: [
      toggleButtonRootBase,
      {
        background: vars.colors.background.surface,
        color: baseColorVar,
        borderColor: baseColorVar,
        borderWidth: vars.borders.width.thin,
        borderStyle: "solid",
        selectors: {
          "&:hover": {
            background: vars.colors.background.surfaceHighlight,
            color: baseColorVar,
            borderColor: baseColorVar,
          },
          "&[disabled]": {
            background: vars.colors.button.default.disabled.background,
            color: vars.colors.button.default.disabled.text,
            borderColor: vars.colors.button.default.disabled.border,
          },
        },
      },
    ],
    selected: [
      toggleButtonRootBase,
      {
        background: baseColorVar,
        color: vars.colors.button.primary.base.text,
        borderColor: baseColorVar,
        borderWidth: vars.borders.width.thin,
        borderStyle: "solid",
        selectors: {
          "&:hover": {
            background: baseColorVar,
            color: vars.colors.button.primary.base.text,
            borderColor: baseColorVar,
          },
          "&[disabled]": {
            background: vars.colors.button.primary.disabled.background,
            color: vars.colors.button.primary.disabled.text,
            borderColor: vars.colors.button.primary.disabled.border,
          },
        },
      },
    ],
    // Sizes
    sm: {
      height: `calc(${vars.spacing._7} + 1px)`,
      fontSize: vars.typography.fontSizes.sm,
    },
    md: {
      height: `calc(${vars.spacing._9} + 1px)`,
      fontSize: vars.typography.fontSizes.md,
    },
    lg: {
      height: `calc(${vars.spacing._10} + 1px)`,
      fontSize: vars.typography.fontSizes.lg,
    },
  }),
};

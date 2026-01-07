import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

const iconButtonRootBase = style({
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  padding: vars.spacing._1,
  borderRadius: vars.borders.radius.md,
  color: vars.colors.text.primary,
  fontSize: vars.typography.fontSizes.md,
  cursor: "pointer",
  selectors: {
    "&[disabled]": {
      cursor: "not-allowed",
    },
  },
});

export const IconButton = {
  root: styleVariants({
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
          '&[data-selected="true"]': {
            background: vars.colors.button.invisible.selected.background,
            color: vars.colors.button.invisible.selected.text,
            borderColor: vars.colors.button.invisible.selected.border,
          },
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
  }),
};

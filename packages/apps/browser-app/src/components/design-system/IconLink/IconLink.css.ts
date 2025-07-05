import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

const iconLinkRootBase = style({
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  padding: vars.spacing._1,
  borderRadius: vars.borders.radius.md,
  color: vars.colors.text.primary,
  cursor: "pointer",
});

export const IconLink = {
  root: styleVariants({
    invisible: [
      iconLinkRootBase,
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
  }),
};

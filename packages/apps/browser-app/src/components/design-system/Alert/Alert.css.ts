import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

const alertRootBase = style({
  marginBlock: vars.spacing._8,
  paddingInline: vars.spacing._4,
  borderRadius: vars.borders.radius.md,
  borderWidth: vars.borders.width.thin,
  borderStyle: "solid",
});

const alertTitleBase = style({
  fontSize: vars.typography.fontSizes.md,
  fontWeight: vars.typography.fontWeights.medium,
});

export const Alert = {
  root: styleVariants({
    neutral: [
      alertRootBase,
      {
        background: vars.colors.background.surfaceHighlight,
        borderColor: vars.colors.border.default,
      },
    ],
    info: [
      alertRootBase,
      {
        background: vars.colors.semantic.info.background,
        borderColor: vars.colors.semantic.info.border,
      },
    ],
    error: [
      alertRootBase,
      {
        background: vars.colors.semantic.error.background,
        borderColor: vars.colors.semantic.error.border,
      },
    ],
  }),
  title: styleVariants({
    neutral: [alertTitleBase, { color: vars.colors.text.primary }],
    info: [alertTitleBase, { color: vars.colors.semantic.info.text }],
    error: [alertTitleBase, { color: vars.colors.semantic.error.text }],
  }),
};

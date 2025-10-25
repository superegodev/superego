import { globalStyle, style, styleVariants } from "@vanilla-extract/css";
import { dark, vars } from "../../../themes.css.js";

const alertRootBase = style({
  width: "100%",
  overflow: "scroll",
  marginBlock: vars.spacing._4,
  padding: vars.spacing._4,
  borderRadius: vars.borders.radius.md,
  borderWidth: vars.borders.width.thin,
  borderStyle: "solid",
  fontSize: vars.typography.fontSizes.sm,
  selectors: {
    "&:first-child": {
      marginBlockStart: 0,
    },
    [`${dark} &`]: {
      borderColor: "transparent",
    },
  },
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
        color: vars.colors.text.primary,
        background: vars.colors.background.surfaceHighlight,
        borderColor: vars.colors.border.default,
      },
    ],
    info: [
      alertRootBase,
      {
        color: vars.colors.semantic.info.text,
        background: vars.colors.semantic.info.background,
        borderColor: vars.colors.semantic.info.border,
      },
    ],
    warning: [
      alertRootBase,
      {
        color: vars.colors.semantic.warning.text,
        background: vars.colors.semantic.warning.background,
        borderColor: vars.colors.semantic.warning.border,
      },
    ],
    error: [
      alertRootBase,
      {
        color: vars.colors.semantic.error.text,
        background: vars.colors.semantic.error.background,
        borderColor: vars.colors.semantic.error.border,
      },
    ],
  }),

  title: styleVariants({
    neutral: [alertTitleBase, { color: vars.colors.text.primary }],
    info: [alertTitleBase, { color: vars.colors.semantic.info.text }],
    warning: [alertTitleBase, { color: vars.colors.semantic.warning.text }],
    error: [alertTitleBase, { color: vars.colors.semantic.error.text }],
  }),
};

globalStyle(`${alertRootBase} > :first-child`, {
  marginBlockStart: 0,
});

globalStyle(`${alertRootBase} > :last-child`, {
  marginBlockEnd: 0,
});

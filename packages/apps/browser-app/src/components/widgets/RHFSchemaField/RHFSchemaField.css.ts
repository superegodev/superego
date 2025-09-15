import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const RHFSchemaField = {
  root: style({
    marginBlockEnd: vars.spacing._6,
    selectors: {
      '&[data-disabled="true"]': {
        color: vars.colors.text.secondary,
      },
    },
  }),

  errorLine: style({
    marginBlockEnd: vars.spacing._1,
  }),

  pre: style({
    display: "inline",
    borderRadius: vars.borders.radius.md,
    background: vars.colors.semantic.error.background,
    marginInlineStart: vars.spacing._1,
    paddingInline: vars.spacing._1,
    fontSize: vars.typography.fontSizes.xs2,
  }),
};

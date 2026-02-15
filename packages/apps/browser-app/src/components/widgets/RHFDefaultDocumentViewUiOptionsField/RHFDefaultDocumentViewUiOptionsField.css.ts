import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const RHFDefaultDocumentViewUiOptionsField = {
  root: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._2,
    selectors: {
      '&[data-disabled="true"]': {
        color: vars.colors.text.secondary,
      },
    },
  }),

  errorLine: style({
    marginBlockEnd: vars.spacing._1,
  }),

  inlineCode: style({
    background: vars.colors.semantic.error.background,
    color: vars.colors.semantic.error.text,
    fontSize: vars.typography.fontSizes.xs,
  }),
};

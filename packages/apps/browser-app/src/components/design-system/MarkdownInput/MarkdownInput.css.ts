import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const MarkdownInput = {
  root: style({
    width: "100%",
    borderRadius: vars.borders.radius.md,
    marginBlockEnd: vars.spacing._2,
    selectors: {
      '&[data-has-focus="true"]': {
        outline: `2px solid ${vars.colors.accent}`,
        outlineOffset: "-2px",
      },
      '&[aria-invalid="true"]': {
        borderColor: vars.colors.semantic.error.border,
      },
    },
  }),
};

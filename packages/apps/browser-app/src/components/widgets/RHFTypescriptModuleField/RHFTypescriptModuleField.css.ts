import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const RHFTypescriptModuleField = {
  root: style({
    marginBlockEnd: vars.spacing._6,
    selectors: {
      '&[data-disabled="true"]': {
        color: vars.colors.text.secondary,
      },
    },
  }),
};

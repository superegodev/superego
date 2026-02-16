import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const RHFTypescriptModuleField = {
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

  error: style({
    selectors: {
      ":has(.monaco-editor.focused) &": {
        display: "none",
      },
    },
  }),
};

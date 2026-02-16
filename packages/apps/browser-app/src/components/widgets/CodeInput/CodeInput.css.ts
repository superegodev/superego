import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const EagerCodeInput = {
  root: style({
    position: "relative",
    selectors: {
      "&::before": {
        content: "",
        pointerEvents: "none",
        zIndex: 9,
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
        borderRadius: vars.borders.radius.md,
      },
      '&[aria-invalid="true"]:not(:has(.monaco-editor.focused))::before': {
        borderColor: vars.colors.semantic.error.border,
      },
    },
  }),
};

globalStyle(`${EagerCodeInput.root}[aria-disabled="true"] *`, {
  color: `${vars.colors.text.secondary} !important`,
});

import { globalStyle, style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const CodeInput = {
  root: style({
    position: "relative",
    marginBlockEnd: vars.spacing._2,
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
globalStyle(`${CodeInput.root}[aria-disabled="true"] *`, {
  color: `${vars.colors.text.secondary} !important`,
});

const compilationInProgressIndicatorRootBase = style({
  position: "absolute",
  top: vars.spacing._1,
  right: vars.spacing._1,
  color: vars.colors.semantic.pending.text,
  fontSize: vars.typography.fontSizes.xs2,
  fontWeight: vars.typography.fontWeights.medium,
  fontStyle: "italic",
  transition: "opacity 0ms",
  transitionDelay: "150ms",
});
export const CompilationInProgressIndicator = {
  root: styleVariants({
    visible: [compilationInProgressIndicatorRootBase, { opacity: 1 }],
    hidden: [compilationInProgressIndicatorRootBase, { opacity: 0 }],
  }),
};

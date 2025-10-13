import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../../themes.css.js";

const compilationInProgressIndicatorRootBase = style({
  position: "absolute",
  bottom: vars.spacing._2,
  right: vars.spacing._2,
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

export const ImplementWithAssistantButton = {
  button: style({
    position: "absolute",
    top: vars.spacing._1,
    right: vars.spacing._1,
    fontSize: vars.typography.fontSizes.lg,
    zIndex: 9,
  }),

  implementingMask: style({
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    background: vars.colors.background.surface,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: vars.spacing._2,
  }),
};

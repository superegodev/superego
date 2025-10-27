import { keyframes, style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const EagerRHFAppVersionFilesField = {
  root: style({
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._4,
  }),

  editingToolbar: style({
    flexShrink: 0,
  }),

  content: style({
    position: "relative",
    flexGrow: 1,
    minHeight: 0,
    overflow: "scroll",
  }),

  preview: styleVariants({
    visible: {
      display: "flex",
    },
    hidden: {
      position: "absolute",
      visibility: "hidden",
    },
  }),

  typescriptModule: styleVariants({
    visible: {},
    hidden: { display: "none" },
  }),

  typescriptModuleCodeInput: style({
    height: "100%",
  }),

  userMessageContentInput: style({
    flexShrink: 0,
    maxWidth: vars.spacing._200,
    alignSelf: "center",
  }),
};

const previewRootBase = style({
  border: `${vars.borders.width.thin} dashed ${vars.colors.border.default}`,
  borderRadius: vars.borders.radius.md,
  padding: vars.spacing._2,
  width: "100%",
  height: "100%",
  overflow: "scroll",
});
export const Preview = {
  root: styleVariants({
    valid: [previewRootBase],
    invalid: [
      previewRootBase,
      {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: vars.typography.fontSizes.lg,
        color: vars.colors.semantic.error.text,
        borderColor: vars.colors.semantic.error.border,
      },
    ],
  }),
};

export const EditingToolbar = {
  root: style({
    flexShrink: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }),

  button: style({
    fontSize: vars.typography.fontSizes.lg,
  }),
};

const slideIn = keyframes({
  from: { opacity: 0, transform: "translateY(0.5em)" },
  to: { opacity: 1, transform: "translateY(0)" },
});
const slideOut = keyframes({
  from: { opacity: 1, transform: "translateY(0)" },
  to: { opacity: 0, transform: "translateY(-0.5em)" },
});
export const ImplementingSpinner = {
  root: style({
    position: "absolute",
    inset: 0,
    zIndex: 999,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: vars.spacing._8,
    background: `rgb(from ${vars.colors.background.surface} r g b / 0.9)`,
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.xl,
    fontStyle: "italic",
  }),

  logo: style({
    opacity: 1,
    width: vars.spacing._32,
  }),

  sentence: styleVariants({
    appearing: {
      animation: `${slideIn} 1000ms cubic-bezier(.2,.8,.2,1) both`,
    },
    disappearing: {
      animation: `${slideOut} 1000ms cubic-bezier(.2,.8,.2,1) both`,
    },
  }),
};

export const ResolveIncompatibilityModal = {
  buttons: style({
    marginBlockStart: vars.spacing._8,
    display: "flex",
    gap: vars.spacing._2,
  }),
};

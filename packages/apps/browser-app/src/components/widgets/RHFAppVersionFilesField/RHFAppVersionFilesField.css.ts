import { style, styleVariants } from "@vanilla-extract/css";
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
    flexGrow: 1,
    minHeight: 0,
    overflow: "scroll",
  }),

  preview: styleVariants({
    visible: {},
    hidden: { display: "none !important" },
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
  border: `${vars.borders.width.thin} dotted ${vars.colors.border.subtle}`,
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

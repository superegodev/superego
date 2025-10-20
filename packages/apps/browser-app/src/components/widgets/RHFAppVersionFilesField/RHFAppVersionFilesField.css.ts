import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const RHFAppVersionFilesField = {
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
  }),

  typescriptModule: styleVariants({
    visible: { height: "100%" },
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

export const Preview = {
  root: style({
    border: `${vars.borders.width.thin} dotted ${vars.colors.border.subtle}`,
    width: "100%",
    height: "100%",
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

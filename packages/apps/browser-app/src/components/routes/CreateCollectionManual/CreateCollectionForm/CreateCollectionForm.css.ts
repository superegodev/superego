import { style } from "@vanilla-extract/css";
import { vars } from "../../../../themes.css.js";

export const CreateCollectionForm = {
  submitButtonContainer: style({
    display: "flex",
    justifyContent: "flex-end",
  }),
};

export const TabTitle = {
  root: style({
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._2,
  }),

  icon: style({
    color: vars.colors.semantic.error.text,
  }),
};

export const GeneralSettingsTab = {
  nameIconInputs: style({
    display: "flex",
    columnGap: vars.spacing._2,
  }),

  nameInput: style({
    flexGrow: 1,
  }),
};

import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const CreateCollectionForm = {
  nameIconInputs: style({
    display: "flex",
    columnGap: vars.spacing._2,
  }),
  nameInput: style({
    flexGrow: 1,
  }),
  schemaTextField: style({
    minHeight: vars.spacing._80,
  }),
  submitButtonContainer: style({
    display: "flex",
    justifyContent: "flex-end",
  }),
};

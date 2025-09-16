import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const CreateNewCollectionVersionForm = {
  schemaTextField: style({
    minHeight: vars.spacing._80,
  }),

  submitButtonContainer: style({
    display: "flex",
    justifyContent: "flex-end",
  }),
};

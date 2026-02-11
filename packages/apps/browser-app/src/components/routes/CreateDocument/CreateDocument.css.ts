import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const CreateDocumentForm = {
  submitButtonContainer: style({
    display: "flex",
    justifyContent: "flex-end",
  }),
};

export const DuplicateDocumentDetectedModal = {
  duplicateDocument: style({
    display: "flex",
    justifyContent: "center",
    marginBlock: vars.spacing._10,
  }),
};

import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const UpdateCollectionSettingsForm = {
  nameIconInputs: style({
    display: "flex",
    columnGap: vars.spacing._2,
  }),

  nameInput: style({
    flexGrow: 1,
  }),

  submitButtonContainer: style({
    display: "flex",
    justifyContent: "flex-end",
  }),
};

export const UpdateCollectionVersionSettingsForm = {
  submitButtonContainer: style({
    display: "flex",
    justifyContent: "flex-end",
  }),
};

export const SetCollectionRemoteForm = {
  root: style({
    display: "flex",
    flexDirection: "column",
  }),

  buttons: style({
    display: "flex",
    justifyContent: "flex-end",
    gap: vars.spacing._2,
  }),
};

import { style } from "@vanilla-extract/css";

export const CreateApp = {
  panelContent: style({
    minHeight: 0,
  }),
};

export const CreateAppForm = {
  root: style({
    height: "100%",
  }),
};

export const SetNameAndSaveModal = {
  submitButtonContainer: style({
    display: "flex",
    justifyContent: "flex-end",
  }),
};

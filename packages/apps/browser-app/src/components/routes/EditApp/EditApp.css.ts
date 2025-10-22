import { style } from "@vanilla-extract/css";

export const EditApp = {
  panelContent: style({
    minHeight: 0,
  }),
};

export const CreateNewAppVersionForm = {
  root: style({
    height: "100%",
  }),
};

export const UpdateNameModalForm = {
  submitButtonContainer: style({
    display: "flex",
    justifyContent: "flex-end",
  }),
};

export const DeleteAppModalForm = {
  submitButtonContainer: style({
    display: "flex",
    justifyContent: "flex-end",
  }),
};

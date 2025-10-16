import { style } from "@vanilla-extract/css";
import { vars } from "../../../../themes.css.js";

export const MigrationTab = {
  submitButtonContainer: style({
    display: "flex",
    justifyContent: "flex-end",
  }),
};

export const RemoteConvertersTab = {
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

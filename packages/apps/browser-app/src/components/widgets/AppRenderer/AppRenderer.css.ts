import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const AppRenderer = {
  sandbox: style({
    border: 0,
    width: "100%",
    overflowX: "scroll",
  }),
};

export const IncompatibilityWarning = {
  buttons: style({
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._2,
  }),
};

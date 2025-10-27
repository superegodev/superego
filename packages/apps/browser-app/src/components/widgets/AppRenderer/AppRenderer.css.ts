import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const AppRenderer = {
  sandbox: style({
    border: 0,
    width: "100%",
    flexGrow: 1,
    overflowX: "scroll",
  }),
};

export const IncompatibilityWarning = {
  buttons: style({
    marginBlockStart: vars.spacing._8,
    display: "flex",
    gap: vars.spacing._2,
  }),
};

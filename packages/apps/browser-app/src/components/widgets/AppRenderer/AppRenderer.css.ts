import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const AppRenderer = {
  sandbox: style({
    display: "block",
    height: "100%",
    width: "100%",
    overflow: "hidden",
    border: 0,
    margin: 0,
    padding: 0,
  }),
};

export const IncompatibilityWarning = {
  root: style({
    margin: `${vars.spacing._8} !important`,
    width: `calc(100% - 2 * ${vars.spacing._8})`,
  }),

  buttons: style({
    marginBlockStart: vars.spacing._8,
    display: "flex",
    gap: vars.spacing._2,
  }),

  linkButton: style({
    textDecoration: "none",
  }),
};

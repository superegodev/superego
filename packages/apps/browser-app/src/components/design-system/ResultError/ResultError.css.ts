import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const ResultError = {
  root: style({
    maxHeight: vars.spacing._64,
    overflow: "scroll",
  }),
};

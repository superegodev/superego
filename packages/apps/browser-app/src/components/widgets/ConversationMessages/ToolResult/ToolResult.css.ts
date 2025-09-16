import { style } from "@vanilla-extract/css";
import { vars } from "../../../../themes.css.js";

export const SuccessfulCreateDocument = {
  root: style({
    display: "block",
    textDecoration: "none",
    marginBlock: vars.spacing._2,
    color: vars.colors.text.primary,
  }),

  title: style({
    color: vars.colors.text.primary,
    marginBlockEnd: vars.spacing._2,
  }),
};

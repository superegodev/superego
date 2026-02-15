import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const RHFEmojiField = {
  root: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._2,
  }),
};

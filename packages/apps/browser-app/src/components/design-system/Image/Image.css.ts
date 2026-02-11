import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const Image = {
  placeholder: style({
    background: vars.colors.background.surfaceHighlight,
  }),
};

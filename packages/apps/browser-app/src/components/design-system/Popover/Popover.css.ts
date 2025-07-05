import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const Popover = {
  root: style({
    padding: vars.spacing._1,
    background: vars.colors.background.surface,
    borderColor: vars.colors.border.default,
    borderWidth: vars.borders.width.thin,
    borderStyle: "solid",
    borderRadius: vars.borders.radius.md,
  }),
};

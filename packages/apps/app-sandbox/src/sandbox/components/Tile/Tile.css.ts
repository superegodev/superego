import { style } from "@vanilla-extract/css";
import { vars } from "../../themes.css.js";

export const Tile = {
  root: style({
    padding: vars.spacing._4,
    background: vars.colors.background.subtleSurface,
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
  }),
};

import { style } from "@vanilla-extract/css";
import { vars } from "../../themes.css.js";

export const Tile = {
  root: style({
    width: "100%",
    height: "100%",
    padding: vars.spacing._4,
    background: vars.colors.background.subtleSurface,
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
  }),
};

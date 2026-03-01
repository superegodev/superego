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
    boxShadow: `0 ${vars.spacing._2} ${vars.spacing._4} rgb(from ${vars.colors.background.inverseHighlight} r g b / 0.25)`,
  }),

  arrow: style({
    display: "block",
    fill: vars.colors.background.surface,
    stroke: vars.colors.border.default,
    strokeWidth: vars.borders.width.thin,
    selectors: {
      "[data-placement=bottom] &": {
        transform: "rotate(180deg)",
      },
      "[data-placement=left] &": {
        transform: "rotate(-90deg)",
      },
      "[data-placement=right] &": {
        transform: "rotate(90deg)",
      },
    },
  }),
};

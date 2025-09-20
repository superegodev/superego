import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const LoadDemoDataButton = {
  root: style({
    position: "fixed",
    bottom: vars.spacing._8,
    right: vars.spacing._8,
    zIndex: 99999,
    borderRadius: vars.borders.radius.full,
    fontSize: vars.typography.fontSizes.xl3,
    padding: vars.spacing._3,
  }),

  popover: style({
    width: vars.spacing._100,
    padding: vars.spacing._4,
    fontSize: vars.typography.fontSizes.sm,
  }),

  heading: style({
    marginBlockStart: vars.spacing._2,
    fontSize: vars.typography.fontSizes.lg,
    fontWeight: vars.typography.fontWeights.medium,
  }),
};

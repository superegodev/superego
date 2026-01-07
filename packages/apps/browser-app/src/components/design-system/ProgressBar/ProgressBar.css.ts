import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const ProgressBar = {
  root: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._2,
    width: "100%",
  }),

  header: style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }),

  label: style({
    fontSize: vars.typography.fontSizes.md,
    color: vars.colors.text.secondary,
  }),

  percentage: style({
    fontSize: vars.typography.fontSizes.md,
    color: vars.colors.text.secondary,
  }),

  track: style({
    height: "8px",
    borderRadius: vars.borders.radius.full,
    background: vars.colors.background.surfaceHighlight,
    overflow: "hidden",
  }),

  fill: style({
    height: "100%",
    width: "var(--percentage)",
    borderRadius: vars.borders.radius.full,
    background: vars.colors.button.primary.base.background,
    transition: "width 0.2s ease-out",
  }),
};

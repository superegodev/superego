import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const BackgroundJobs = {
  details: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._4,
  }),

  detailRow: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._2,
  }),

  detailLabel: style({
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.sm,
  }),

  detailValue: style({
    fontSize: vars.typography.fontSizes.md,
    color: vars.colors.text.primary,
  }),

  codeBlock: style({
    backgroundColor: vars.colors.background.secondarySurface,
    borderRadius: vars.borders.radius.md,
    padding: vars.spacing._3,
    fontFamily: vars.typography.fontFamilies.monospace,
    fontSize: vars.typography.fontSizes.sm,
    whiteSpace: "pre-wrap",
  }),
};

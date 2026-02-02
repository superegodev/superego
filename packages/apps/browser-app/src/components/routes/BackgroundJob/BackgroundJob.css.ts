import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const BackgroundJob = {
  codeBlock: style({
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
  }),
};

export const DetailRow = {
  root: style({
    marginBlockEnd: vars.spacing._6,
  }),

  label: style({
    marginBlockEnd: vars.spacing._2,
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.sm,
    whiteSpace: "nowrap",
  }),

  value: style({
    marginInlineStart: 0,
    color: vars.colors.text.primary,
    fontSize: vars.typography.fontSizes.md,
  }),
};

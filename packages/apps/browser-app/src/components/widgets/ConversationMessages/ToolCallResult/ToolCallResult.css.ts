import { style } from "@vanilla-extract/css";
import { vars } from "../../../../themes.css.js";

export const ToolCallResult = {
  root: style({
    position: "relative",
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
    marginBlockStart: vars.spacing._8,
  }),

  triggerButton: style({
    background: "transparent",
    padding: 0,
    margin: 0,
    border: 0,
    cursor: "pointer",
  }),

  call: style({
    borderBlockStart: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    marginBlockEnd: vars.spacing._2,
  }),

  result: style({
    borderBlockStart: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    marginBlockEnd: vars.spacing._2,
  }),
};

export const Title = {
  root: style({
    fontSize: vars.typography.fontSizes.sm,
    fontWeight: vars.typography.fontWeights.semibold,
    padding: vars.spacing._3,
    margin: 0,
  }),
};

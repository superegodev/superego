import { style } from "@vanilla-extract/css";
import { vars } from "../../../../themes.css.js";

export const SuccessfulCreateDocument = {
  root: style({
    display: "block",
    textDecoration: "none",
    marginBlock: vars.spacing._2,
  }),

  title: style({
    color: vars.colors.text.primary,
    marginBlockEnd: vars.spacing._2,
  }),

  summaryProperties: style({
    display: "inline-table",
    width: "auto",
    padding: vars.spacing._4,
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
    margin: 0,
  }),

  summaryProperty: style({
    display: "table-row",
    marginBlockEnd: vars.spacing._2,
  }),

  summaryPropertyName: style({
    display: "table-cell",
    verticalAlign: "middle",
    paddingBlock: vars.spacing._1,
    paddingInlineEnd: vars.spacing._8,
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.xs,
    whiteSpace: "nowrap",
  }),

  summaryPropertyValue: style({
    display: "table-cell",
    minWidth: vars.spacing._40,
    verticalAlign: "middle",
    paddingInlineEnd: vars.spacing._8,
    color: vars.colors.text.primary,
    fontSize: vars.typography.fontSizes.sm,
  }),
};

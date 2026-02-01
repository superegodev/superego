import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

const controlSize = vars.spacing._8;

export const Pagination = {
  root: style({
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._1,
  }),

  pageButton: style({
    minWidth: controlSize,
    height: controlSize,
    paddingInline: vars.spacing._2,
    paddingBlock: 0,
    fontSize: vars.typography.fontSizes.sm,
  }),

  prevNextButton: style({
    width: controlSize,
    height: controlSize,
    paddingInline: vars.spacing._2,
    paddingBlock: 0,
    fontSize: vars.typography.fontSizes.lg,
  }),

  ellipsis: style({
    width: controlSize,
    height: controlSize,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.md,
  }),

  itemsInfo: style({
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.sm,
    marginRight: "auto",
  }),
};

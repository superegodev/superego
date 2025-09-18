import { style } from "@vanilla-extract/css";
import { vars } from "../../../../themes.css.js";

export const CreateDocumentOrVersion = {
  root: style({
    display: "block",
    textDecoration: "none",
    marginBlock: vars.spacing._2,
    color: vars.colors.text.primary,
  }),

  title: style({
    color: vars.colors.text.primary,
    marginBlockEnd: vars.spacing._2,
  }),

  contentSummarySkeleton: style({
    width: vars.spacing._80,
    padding: vars.spacing._4,
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
    margin: 0,
    overflow: "hidden",
  }),
};

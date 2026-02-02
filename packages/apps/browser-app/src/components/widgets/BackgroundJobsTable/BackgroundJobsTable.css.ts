import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const BackgroundJobsTable = {
  root: style({
    display: "flex",
    flexDirection: "column",
  }),

  tableContainer: style({
    flexGrow: 1,
    minHeight: 0,
  }),

  pagination: style({
    flexShrink: 0,
    marginBlockStart: vars.spacing._2,
  }),
};

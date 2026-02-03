import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const DocumentsTable = {
  root: style({
    height: "100%",
    display: "flex",
    flexDirection: "column",
  }),

  tableContainer: style({
    flexGrow: 1,
    minHeight: 0,
  }),

  table: style({
    height: "100%",
  }),

  pagination: style({
    flexShrink: 0,
    marginBlockStart: vars.spacing._2,
  }),
};

export const DocumentsTableRow = {
  remoteUrlLink: style({
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }),
};

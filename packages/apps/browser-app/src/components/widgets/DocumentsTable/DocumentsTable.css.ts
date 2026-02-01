import { style } from "@vanilla-extract/css";

export const DocumentsTable = {
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
    justifyContent: "center",
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

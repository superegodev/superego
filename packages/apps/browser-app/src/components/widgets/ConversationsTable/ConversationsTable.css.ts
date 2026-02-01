import { style } from "@vanilla-extract/css";

export const ConversationsTable = {
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

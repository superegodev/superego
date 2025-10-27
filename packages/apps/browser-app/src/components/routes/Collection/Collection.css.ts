import { style, styleVariants } from "@vanilla-extract/css";

export const Collection = {
  panelContent: styleVariants({
    table: {
      minHeight: 0,
    },
    app: {
      display: "flex",
    },
  }),

  documentsTable: style({
    flexGrow: 1,
    height: "100%",
  }),
};

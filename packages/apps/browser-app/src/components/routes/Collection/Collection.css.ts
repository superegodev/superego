import { style, styleVariants } from "@vanilla-extract/css";

export const Collection = {
  panelHeaderMenuItem: style({
    display: "flex",
    alignItems: "center",
  }),

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

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
      flexGrow: 1,
      padding: "0 !important",
    },
  }),
};

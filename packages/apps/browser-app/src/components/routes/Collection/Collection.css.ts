import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const Collection = {
  panelContent: style({
    display: "flex",
    flexDirection: "column",
    height: `calc(100vh - ${vars.shell.panelHeaderHeight})`,
    width: "100%",
  }),

  documentsTable: style({
    flexGrow: 1,
    height: "100%",
  }),
};

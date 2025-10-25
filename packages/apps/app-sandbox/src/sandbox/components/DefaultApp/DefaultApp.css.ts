import { style } from "@vanilla-extract/css";
import { vars } from "../../themes.css.js";

export const DefaultApp = {
  root: style({
    display: "flex",
    flexDirection: "column",
    height: "calc(100swh - 500px)",
    paddingInline: `max(calc(50% - ${vars.spacing._100}), ${vars.spacing._8})`,
  }),
};

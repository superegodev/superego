import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const RHFContentBlockingKeysGetterField = {
  root: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._6,
  }),

  switchGroup: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._2,
  }),

  deduplicationDescription: style({
    display: "block",
  }),
};

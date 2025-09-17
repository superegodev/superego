import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const CreateCollectionAssisted = {
  root: style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }),

  logo: style({
    width: vars.spacing._32,
    marginBlockEnd: vars.spacing._16,
  }),
};

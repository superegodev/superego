import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const Disclosure = {
  trigger: style({
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._1,
    marginBlockEnd: vars.spacing._05,
    paddingInlineStart: 0,
    selectors: {
      "&:hover": {
        background: "transparent",
      },
    },
  }),
};

import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const FieldLabel = {
  root: style({
    display: "block",
    position: "relative",
  }),
  actions: style({
    position: "absolute",
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
    selectors: {
      "legend &": {
        transform: `translateY(calc(-50% - ${vars.spacing._1}))`,
      },
      'legend:has(> span[aria-expanded="false"]) &': {
        display: "none",
      },
    },
  }),
};

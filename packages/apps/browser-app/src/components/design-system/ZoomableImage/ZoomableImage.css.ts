import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const ZoomableImage = {
  root: style({
    position: "relative",
    overflow: "hidden",
  }),

  wrapper: style({
    height: "100% !important",
  }),

  image: style({
    width: "100%",
  }),
};

export const Controls = {
  root: style({
    position: "absolute",
    top: vars.spacing._2,
    left: vars.spacing._2,
    zIndex: 1,
    display: "flex",
    gap: vars.spacing._1,
    opacity: 0,
    transition: "opacity 300ms",
    selectors: {
      ":hover > &": {
        opacity: 1,
      },
    },
  }),
};

import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const Carousel = {
  root: style({
    display: "flex",
    flexDirection: "column",
  }),

  viewport: style({
    overflow: "hidden",
  }),

  track: style({
    display: "flex",
    "@media": {
      "(prefers-reduced-motion: no-preference)": {
        transition: "transform 300ms ease-in-out",
      },
    },
  }),

  slide: style({
    flexShrink: 0,
    width: "100%",
  }),

  image: style({
    width: "100%",
    aspectRatio: "16 / 10",
    objectFit: "contain",
    objectPosition: "bottom",
    display: "block",
  }),

  controls: style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: vars.spacing._0_5,
    paddingBlockStart: vars.spacing._2,
  }),

  indicator: style({
    fontSize: vars.typography.fontSizes.xs,
    color: vars.colors.text.secondary,
    selectors: {
      '&[data-active="true"]': {
        color: vars.colors.text.primary,
      },
    },
  }),
};

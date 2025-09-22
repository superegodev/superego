import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

const bounce = keyframes({
  "0%, 50%, 100%": {
    transform: "translateY(0)",
  },
  "25%": {
    transform: `translateY(calc(-1 * ${vars.spacing._0_5}))`,
  },
  "75%": {
    transform: `translateY(${vars.spacing._0_5})`,
  },
});

export const ThreeDotSpinner = {
  root: style({
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: vars.spacing._1,
  }),

  dot: style({
    height: "35%",
    aspectRatio: "1 / 1",
    background: vars.colors.text.secondary,
    borderRadius: vars.borders.radius.full,
    animation: `${bounce} 1s infinite linear both`,
  }),

  dotDelayTwo: style({
    animationDelay: "0.25s",
  }),

  dotDelayThree: style({
    animationDelay: "0.5s",
  }),
};

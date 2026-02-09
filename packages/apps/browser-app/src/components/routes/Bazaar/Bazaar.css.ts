import { style } from "@vanilla-extract/css";
import { breakpoints, vars } from "../../../themes.css.js";

export const Bazaar = {
  grid: style({
    display: "grid",
    gap: vars.spacing._4,
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    "@media": {
      [`(max-width: ${breakpoints.medium})`]: {
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      },
      [`(max-width: ${breakpoints.small})`]: {
        gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
      },
    },
  }),
};

import { style, styleVariants } from "@vanilla-extract/css";
import { breakpoints, vars } from "../../themes.css.js";

const spanValues = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  11: 11,
  12: 12,
} as const;

export const Grid = {
  root: style({
    display: "grid",
    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
    columnGap: vars.spacing._2,
    rowGap: vars.spacing._2,
    width: "100%",
  }),
};

export const Col = {
  root: style({
    minWidth: 0,
  }),
  spanSm: styleVariants(spanValues, (span) => ({
    gridColumn: `span ${span}`,
  })),
  spanMd: styleVariants(spanValues, (span) => ({
    "@media": {
      [`(min-width: ${breakpoints.small})`]: {
        gridColumn: `span ${span}`,
      },
    },
  })),
  spanLg: styleVariants(spanValues, (span) => ({
    "@media": {
      [`(min-width: ${breakpoints.medium})`]: {
        gridColumn: `span ${span}`,
      },
    },
  })),
};

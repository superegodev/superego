import { style } from "@vanilla-extract/css";
import { breakpoints, vars } from "../../../themes.css.js";

export const BazaarPack = {
  root: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._4,
    paddingBlockEnd: vars.spacing._12,
  }),

  titleContainer: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._1,
  }),

  name: style({
    marginBlockEnd: vars.spacing._2,
    fontSize: vars.typography.fontSizes.xl2,
  }),

  counts: style({
    margin: 0,
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.sm,
  }),

  longDescription: style({
    marginBlockStart: vars.spacing._4,
  }),

  installButtonContainer: style({
    position: "sticky",
    bottom: vars.spacing._8,
    display: "flex",
    justifyContent: "flex-end",
    marginBlockStart: vars.spacing._8,
    pointerEvents: "none",
    zIndex: 100,
    "@media": {
      [`(max-width: ${breakpoints.small})`]: {
        bottom: vars.spacing._4,
      },
    },
  }),

  installButton: style({
    minWidth: vars.spacing._32,
    pointerEvents: "auto",
    boxShadow: `0 ${vars.spacing._2} ${vars.spacing._4} rgba(from ${vars.colors.neutral._12} r g b / 0.15)`,
  }),
};

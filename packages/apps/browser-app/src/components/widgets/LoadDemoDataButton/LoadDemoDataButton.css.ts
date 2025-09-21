import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

const loadDemoDataButtonButtonBase = style({
  position: "fixed",
  zIndex: 99999,
  borderRadius: vars.borders.radius.full,
  transition: "all 300ms ease",
  fontSize: vars.typography.fontSizes.xl3,
  padding: vars.spacing._3,
  marginBlockEnd: vars.spacing._8,
  marginInlineEnd: vars.spacing._8,
});
export const LoadDemoDataButton = {
  root: style({
    position: "fixed",
    bottom: 0,
    right: 0,
    width: vars.spacing._24,
    height: vars.spacing._24,
    zIndex: 99999,
    display: "flex",
    alignItems: "end",
    justifyContent: "end",
  }),

  button: styleVariants({
    small: [
      loadDemoDataButtonButtonBase,
      {
        selectors: {
          ":not(:hover) > &": {
            fontSize: vars.typography.fontSizes.md,
            padding: vars.spacing._2,
            marginBlockEnd: vars.spacing._2,
            marginInlineEnd: vars.spacing._2,
          },
        },
      },
    ],
    big: [loadDemoDataButtonButtonBase],
  }),

  popover: style({
    width: vars.spacing._100,
    padding: vars.spacing._4,
    fontSize: vars.typography.fontSizes.sm,
  }),

  heading: style({
    marginBlockStart: vars.spacing._2,
    fontSize: vars.typography.fontSizes.lg,
    fontWeight: vars.typography.fontWeights.medium,
  }),
};

import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const Fieldset = {
  root: style({
    padding: 0,
    margin: 0,
    border: 0,
    selectors: {
      "&[disabled]": {
        color: vars.colors.text.secondary,
      },
    },
  }),
};

export const Legend = {
  root: style({
    display: "block",
    position: "relative",
    cursor: "pointer",
    userSelect: "none",
    width: "100%",
    margin: 0,
    padding: 0,
    marginBlockEnd: vars.spacing._4,
    paddingBlockEnd: vars.spacing._2,
    borderBlockEnd: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    fontSize: vars.typography.fontSizes.md,
    fontWeight: vars.typography.fontWeights.medium,
  }),
};

export const Fields = {
  root: style({
    paddingInlineStart: vars.spacing._4,
  }),
};

export const DisclosureTrigger = {
  root: style({
    width: "100%",
    display: "inline-block",
  }),
  indicator: style({
    position: "relative",
    fontSize: vars.typography.fontSizes.sm,
    // Pixel correction to align the icon with the legend text.
    top: 1,
    marginInlineEnd: vars.spacing._1,
  }),
};

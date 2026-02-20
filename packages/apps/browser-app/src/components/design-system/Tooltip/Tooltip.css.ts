import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const Tooltip = {
  root: style({
    paddingBlock: vars.spacing._1,
    paddingInline: vars.spacing._2,
    maxWidth: vars.spacing._64,
    fontSize: vars.typography.fontSizes.md,
    textAlign: "center",
    borderRadius: vars.borders.radius.sm,
    boxShadow: `0 ${vars.spacing._2} ${vars.spacing._4} rgb(from ${vars.colors.background.inverseHighlight} r g b / 0.25)`,
    background: vars.colors.background.inverseHighlight,
    color: vars.colors.text.inverse,
    outline: "none",
    transform: "translate3d(0, 0, 0)",
    "@media": {
      "(prefers-reduced-motion: no-preference)": {
        transition: "transform 200ms, opacity 200ms",
      },
    },
    selectors: {
      '&[data-entering="true"], &[data-exiting="true"]': {
        transform: "var(--origin)",
        opacity: 0,
      },
      '&[data-placement="top"]': {
        marginBlockEnd: vars.spacing._2,
        vars: {
          "--origin": `translateY(${vars.spacing._1})`,
        },
      },
      '&[data-placement="bottom"]': {
        marginBlockStart: vars.spacing._2,
        vars: {
          "--origin": `translateY(calc(-1 * ${vars.spacing._1}))`,
        },
      },
      '&[data-placement="left"]': {
        marginInlineEnd: vars.spacing._2,
        vars: {
          "--origin": `translateX(${vars.spacing._1})`,
        },
      },
      '&[data-placement="right"]': {
        marginInlineStart: vars.spacing._2,
        vars: {
          "--origin": `translateX(calc(-1 * ${vars.spacing._1}))`,
        },
      },
    },
  }),

  arrow: style({
    display: "block",
    fill: vars.colors.background.inverseHighlight,
    selectors: {
      "[data-placement=bottom] &": {
        transform: "rotate(180deg)",
      },
      "[data-placement=left] &": {
        transform: "rotate(-90deg)",
      },
      "[data-placement=right] &": {
        transform: "rotate(90deg)",
      },
    },
  }),
};

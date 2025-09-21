import { style } from "@vanilla-extract/css";
import { dark, vars } from "../../../themes.css.js";

export const UserMessageContentInput = {
  root: style({
    position: "relative",
    width: "100%",
  }),

  textField: style({
    paddingInlineStart: vars.spacing._5,
    paddingInlineEnd: vars.spacing._12,
    paddingBlock: vars.spacing._3,
    borderRadius: vars.borders.radius.full,
    border: `${vars.borders.width.thin} solid ${vars.colors.border.subtle}`,
    boxShadow: `0 ${vars.spacing._0_5} ${vars.spacing._0_5} rgba(from ${vars.colors.border.focus} r g b / 0.1)`,
    selectors: {
      [`${dark} &`]: {
        boxShadow: "none",
        background: vars.colors.background.secondarySurface,
      },
    },
  }),

  textArea: style({
    width: "100%",
    maxHeight: vars.spacing._80,
    fontFamily: vars.typography.fontFamilies.sansSerif,
    fontSize: vars.typography.fontSizes.sm,
    border: 0,
    background: vars.colors.background.surface,
    color: vars.colors.text.primary,
    // Experimental property:
    // https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing
    //
    // Used even if not supported by all browsers since it just enhances the
    // experience, which still works well without it.
    ["fieldSizing" as any]: "content",
    resize: "none",
    selectors: {
      "&:disabled": {
        background: vars.colors.background.surface,
      },
      [`${dark} &, ${dark} &:disabled`]: {
        background: vars.colors.background.secondarySurface,
      },
      "&:focus-visible": {
        outline: "none",
      },
    },
  }),

  spinner: style({
    position: "absolute",
    // Manual pixel adjustment to center the buttons with the default
    // textarea height.
    top: `calc(${vars.spacing._4} + 1px)`,
    right: vars.spacing._4,
    width: vars.spacing._10,
    height: vars.spacing._4,
  }),
};

const sendRecordToolbarButtonBase = style({
  padding: 0,
  marginInlineStart: `calc(-1 * ${vars.spacing._2})`,
  height: vars.spacing._10,
  width: vars.spacing._10,
  borderRadius: vars.borders.radius.full,
  fontSize: vars.typography.fontSizes.xl,
});
export const SendRecordToolbar = {
  root: style({
    position: "absolute",
    // Manual pixel adjustment to center the buttons with the default
    // textarea height.
    bottom: `calc(${vars.spacing._1} + 1.5px)`,
    right: vars.spacing._4,
  }),

  button: sendRecordToolbarButtonBase,

  disabledLookingButton: style([
    sendRecordToolbarButtonBase,
    {
      color: vars.colors.button.invisible.disabled.text,
    },
  ]),
};

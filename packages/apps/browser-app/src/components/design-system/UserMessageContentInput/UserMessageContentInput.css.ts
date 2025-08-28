import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const UserMessageContentInput = {
  root: style({
    position: "relative",
    width: "80%",
  }),

  textField: style({
    paddingInlineStart: vars.spacing._6,
    paddingInlineEnd: vars.spacing._12,
    paddingBlock: vars.spacing._4,
    borderRadius: vars.borders.radius.xl3,
    border: `${vars.borders.width.thin} solid ${vars.colors.border.subtle}`,
    boxShadow: `0 ${vars.spacing._05} ${vars.spacing._05} rgba(from ${vars.colors.neutral._12} r g b / 0.1)`,
  }),

  textArea: style({
    width: "100%",
    maxHeight: vars.spacing._80,
    fontFamily: vars.typography.fontFamilies.sansSerif,
    fontSize: vars.typography.fontSizes.md,
    border: 0,
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
      "&:focus-visible": {
        outline: "none",
      },
    },
  }),

  sendButton: style({
    position: "absolute",
    // Manual pixel adjustment to center the paper plane with the default
    // textarea height.
    bottom: `calc(${vars.spacing._2} + 2.5px)`,
    right: vars.spacing._4,
    height: vars.spacing._10,
    width: vars.spacing._10,
    borderRadius: vars.borders.radius.full,
    fontSize: vars.typography.fontSizes.xl,
  }),
};

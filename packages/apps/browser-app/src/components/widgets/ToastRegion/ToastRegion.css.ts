import { style, styleVariants } from "@vanilla-extract/css";
import ToastType from "../../../business-logic/toasts/ToastType.js";
import { vars } from "../../../themes.css.js";

export const ToastRegion = {
  root: style({
    position: "fixed",
    bottom: vars.spacing._4,
    right: vars.spacing._4,
    gap: vars.spacing._1,
    display: "flex",
    flexDirection: "column-reverse",
    zIndex: 9999,
  }),
};

const toastRootBase = style({
  minWidth: vars.spacing._80,
  maxWidth: vars.spacing._160,
  borderRadius: vars.borders.radius.md,
  padding: vars.spacing._4,
  display: "flex",
  gap: vars.spacing._4,
});
const toastCloseButtonBase = style({
  fontSize: vars.typography.fontSizes.xl,
  padding: 0,
  selectors: {
    "&:hover": {
      background: "transparent",
    },
  },
});
export const Toast = {
  root: styleVariants({
    [ToastType.Success]: [
      toastRootBase,
      {
        background: vars.colors.semantic.success.backgroundFilled,
        color: vars.colors.semantic.success.textFilled,
      },
    ],
    [ToastType.Error]: [
      toastRootBase,
      {
        background: vars.colors.semantic.error.backgroundFilled,
        color: vars.colors.semantic.error.textFilled,
      },
    ],
  }),

  toastContent: style({
    flexGrow: 1,
    overflow: "hidden",
  }),

  title: style({
    display: "block",
    fontSize: vars.typography.fontSizes.md,
    marginBlockEnd: vars.spacing._2,
  }),

  errorDetails: style({
    display: "block",
    fontSize: vars.typography.fontSizes.sm,
  }),

  errorDetailsTitle: style({
    color: vars.colors.semantic.error.textFilled,
    selectors: {
      "&:hover": {
        color: vars.colors.semantic.error.textFilled,
      },
    },
  }),

  errorDetailsCodeBlock: style({
    borderRadius: vars.borders.radius.md,
  }),

  closeButton: styleVariants({
    [ToastType.Success]: [
      toastCloseButtonBase,
      {
        background: vars.colors.semantic.success.backgroundFilled,
        color: vars.colors.semantic.success.textFilled,
        selectors: {
          "&:hover": {
            color: vars.colors.semantic.success.textFilled,
          },
        },
      },
    ],
    [ToastType.Error]: [
      toastCloseButtonBase,
      {
        background: vars.colors.semantic.error.backgroundFilled,
        color: vars.colors.semantic.error.textFilled,
        selectors: {
          "&:hover": {
            color: vars.colors.semantic.error.textFilled,
          },
        },
      },
    ],
  }),
};

import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const PrimarySidebarPanel = {
  root: style({
    height: "100%",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  }),
  topActions: style({
    marginBlockEnd: vars.spacing._4,
    flex: "0 0 auto",
    maxHeight: vars.spacing._64,
    overflow: "auto",
    overscrollBehavior: "contain",
  }),
  collectionsTree: style({
    flex: "1 1 auto",
    minHeight: 0,
    overflow: "auto",
    overscrollBehavior: "contain",
  }),
  bottomActions: style({
    marginBlockStart: vars.spacing._4,
    flex: "0 0 auto",
    maxHeight: vars.spacing._64,
    overflow: "auto",
    overscrollBehavior: "contain",
  }),
};

const primarySidebarPanelActionRootBase = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing._2,
  width: `calc(100% + 2 * ${vars.spacing._2})`,
  paddingBlock: vars.spacing._1,
  paddingInline: vars.spacing._2,
  marginInline: `calc(-1 * ${vars.spacing._2})`,
  marginBlock: vars.spacing._05,
  fontSize: vars.typography.fontSizes.sm,
  color: vars.colors.text.primary,
});

export const PrimarySidebarPanelAction = {
  root: styleVariants({
    link: [
      primarySidebarPanelActionRootBase,
      style({
        textDecoration: "none",
        borderRadius: vars.borders.radius.md,
        selectors: {
          "&:hover": {
            background: vars.colors.background.surfaceHighlight,
          },
        },
      }),
    ],
    button: [primarySidebarPanelActionRootBase],
  }),
};

import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const PrimarySidebarPanel = {
  root: style({
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: 0,
  }),

  topActions: style({
    marginInline: `calc(-1 * ${vars.spacing._2})`,
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
    marginInline: `calc(-1 * ${vars.spacing._2})`,
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
  width: "100%",
  paddingBlock: vars.spacing._1_5,
  paddingInline: vars.spacing._2,
  marginBlock: vars.spacing._0_5,
  lineHeight: vars.typography.lineHeights.tight,
  fontSize: vars.typography.fontSizes.md,
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
    button: [
      primarySidebarPanelActionRootBase,
      style({
        height: "auto",
        justifyContent: "flex-start",
        borderRadius: vars.borders.radius.md,
        selectors: {
          "&:hover": {
            background: vars.colors.background.surfaceHighlight,
          },
        },
      }),
    ],
    highlighted: {
      background: vars.colors.accent,
      color: `${vars.colors.text.onAccent} !important`,
      fontWeight: vars.typography.fontWeights.medium,
      selectors: {
        "&:hover": {
          background: vars.colors.accent,
          color: `${vars.colors.text.onAccent} !important`,
          fontWeight: vars.typography.fontWeights.medium,
        },
      },
    },
  }),
};

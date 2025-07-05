import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const PrimarySidebarPanel = {
  root: style({
    display: "flex",
    flexDirection: "column",
  }),
  topActions: style({
    marginBlockEnd: vars.spacing._6,
  }),
  collectionsTree: style({
    flexGrow: 1,
  }),
  bottomActions: style({}),
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

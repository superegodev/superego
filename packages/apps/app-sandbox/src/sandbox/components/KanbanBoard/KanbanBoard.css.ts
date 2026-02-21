import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../themes.css.js";

export const KanbanBoard = {
  root: style({
    display: "flex",
    gap: vars.spacing._4,
    height: "100%",
    width: "100%",
  }),
};

export const Column = {
  root: style({
    display: "flex",
    flexDirection: "column",
    minWidth: vars.spacing._64,
    flex: "1 1 0%",
    background: vars.colors.background.secondarySurface,
    borderRadius: vars.borders.radius.lg,
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    overflow: "hidden",
  }),

  header: style({
    padding: vars.spacing._3,
    paddingInline: vars.spacing._4,
    fontWeight: vars.typography.fontWeights.medium,
    fontSize: vars.typography.fontSizes.md,
    borderBlockEnd: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
  }),

  list: styleVariants({
    base: {
      display: "flex",
      flexDirection: "column",
      gap: vars.spacing._2,
      padding: vars.spacing._2,
      flex: "1 1 auto",
      overflowY: "auto",
      outline: "none",
    },
    dropTarget: {
      background: vars.colors.background.surfaceHighlight,
    },
  }),
};

export const Card = {
  root: style({
    display: "flex",
    alignItems: "center",
    background: vars.colors.background.surface,
    borderRadius: vars.borders.radius.md,
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    fontSize: vars.typography.fontSizes.md,
    outline: "none",
    selectors: {
      "&[data-dragging]": {
        opacity: 0.5,
      },
      "&[data-focus-visible]": {
        borderColor: vars.colors.border.focus,
      },
    },
  }),

  dragHandle: style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    width: vars.spacing._6,
    flexShrink: 0,
    cursor: "grab",
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.lg,
    background: "none",
    border: "none",
    borderRadius: 0,
    padding: 0,
    outline: "none",
    selectors: {
      "&:hover": {
        color: vars.colors.text.primary,
      },
      "&[data-focus-visible]": {
        color: vars.colors.text.primary,
      },
    },
  }),

  content: style({
    flex: "1 1 auto",
    padding: vars.spacing._3,
    paddingInlineStart: vars.spacing._1,
    minWidth: 0,
  }),
};

export const DropIndicatorStyle = {
  root: style({
    height: vars.borders.width.medium,
    marginBlock: vars.spacing._0_5,
    outline: "none",
    selectors: {
      "&[data-drop-target]": {
        background: vars.colors.border.focus,
      },
    },
  }),
};

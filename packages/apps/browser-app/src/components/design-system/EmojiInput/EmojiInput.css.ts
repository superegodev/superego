import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const EmojiInput = {
  popover: style({
    overflow: "scroll",
  }),

  popoverTrigger: style({
    width: `calc(${vars.spacing._8} + 2 * ${vars.borders.width.thin})`,
    height: `calc(${vars.spacing._8} + 2 * ${vars.borders.width.thin})`,
    marginBlockEnd: vars.spacing._2,
    fontSize: vars.typography.fontSizes.xl,
  }),
};

export const EmojiPicker = {
  root: style({
    display: "flex",
    flexDirection: "column",
    width: "fit-content",
    height: vars.spacing._80,
    backgroundColor: vars.colors.background.surface,
  }),

  search: style({
    position: "relative",
    zIndex: 10,
    appearance: "none",
    marginBlock: vars.spacing._2,
    marginInline: vars.spacing._2,
    padding: vars.spacing._2,
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
    fontSize: vars.typography.fontSizes.sm,
  }),

  selectedEmoji: style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: vars.spacing._2,
    marginBlockStart: vars.spacing._2,
    marginInline: vars.spacing._2,
    fontSize: vars.typography.fontSizes.sm,
    color: vars.colors.text.secondary,
  }),

  viewport: style({
    position: "relative",
    flex: 1,
    outline: "none",
  }),

  list: style({
    paddingBlockEnd: vars.spacing._2,
    userSelect: "none",
  }),

  row: style({
    paddingInline: vars.spacing._2,
    scrollMarginBlock: vars.spacing._2,
  }),

  categoryHeader: style({
    padding: vars.spacing._2,
    paddingBlockEnd: vars.spacing._3,
    backgroundColor: vars.colors.background.surface,
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.xs,
    fontWeight: vars.typography.fontWeights.medium,
  }),

  emoji: style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: vars.spacing._8,
    height: vars.spacing._8,
    borderRadius: vars.borders.radius.md,
    backgroundColor: "transparent",
    fontSize: vars.typography.fontSizes.xl,
    border: "none",
    selectors: {
      "&[data-active]": {
        backgroundColor: vars.colors.background.surfaceHighlight,
      },
    },
  }),

  empty: style({
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.sm,
  }),

  loading: style({
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.sm,
  }),
};

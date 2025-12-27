import { keyframes, style } from "@vanilla-extract/css";
import { dark, light, vars } from "../../../themes.css.js";

const modalOverlayFade = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const modalSlideDown = keyframes({
  from: { opacity: 0, transform: "translateY(-20px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});

export const SearchModal = {
  overlay: style({
    position: "fixed",
    top: 0,
    left: 0,
    width: "100dvw",
    height: "var(--visual-viewport-height)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingBlockStart: vars.spacing._20,
    zIndex: 9999,
    backdropFilter: "blur(2px)",
    selectors: {
      [`${light} &`]: {
        background: `rgb(from ${vars.colors.background.inverse} r g b / .3)`,
      },
      [`${dark} &`]: {
        background: `rgb(from ${vars.colors.background.inverse} r g b / .2)`,
      },
      '&[data-entering="true"]': {
        animation: `${modalOverlayFade} 150ms`,
      },
      '&[data-exiting="true"]': {
        animation: `${modalOverlayFade} 100ms reverse ease-in`,
      },
    },
  }),

  modal: style({
    width: `min(${vars.spacing._160}, calc(100dvw - ${vars.spacing._8}))`,
    maxHeight: `calc(var(--visual-viewport-height) - ${vars.spacing._40})`,
    display: "flex",
    flexDirection: "column",
    background: vars.colors.background.surface,
    borderRadius: vars.borders.radius.lg,
    border: 0,
    outline: "none",
    fontSize: vars.typography.fontSizes.sm,
    color: vars.colors.text.primary,
    boxShadow: `0 ${vars.spacing._4} ${vars.spacing._8} rgba(from ${vars.colors.neutral._12} r g b / 0.15)`,
    overflow: "hidden",
    selectors: {
      '&[data-entering="true"]': {
        animation: `${modalSlideDown} 200ms cubic-bezier(0.16, 1, 0.3, 1)`,
      },
    },
  }),

  keyboard: style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: vars.spacing._1,
    padding: vars.spacing._2,
    borderBlockStart: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    fontSize: vars.typography.fontSizes.xs,
    color: vars.colors.text.secondary,
  }),

  kbd: style({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: vars.spacing._5,
    height: vars.spacing._5,
    padding: `0 ${vars.spacing._1}`,
    background: vars.colors.background.surfaceHighlight,
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.sm,
    fontFamily: vars.typography.fontFamilies.sansSerif,
    fontSize: vars.typography.fontSizes.xs,
  }),
};

export const SearchHeader = {
  root: style({
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._2,
    padding: vars.spacing._3,
    borderBlockEnd: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
  }),

  searchIcon: style({
    flexShrink: 0,
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.lg,
  }),

  input: style({
    flex: 1,
    border: 0,
    outline: "none",
    background: "transparent",
    fontSize: vars.typography.fontSizes.md,
    fontFamily: vars.typography.fontFamilies.sansSerif,
    color: vars.colors.text.primary,
    "::placeholder": {
      color: vars.colors.text.secondary,
    },
  }),

  collectionSelect: style({
    flexShrink: 0,
    marginBlockEnd: 0,
  }),

  collectionSelectButton: style({
    height: vars.spacing._7,
    fontSize: vars.typography.fontSizes.xs,
    paddingInline: vars.spacing._2,
    marginBlockEnd: 0,
  }),
};

export const SearchResults = {
  root: style({
    flex: 1,
    overflowY: "auto",
    overscrollBehavior: "contain",
  }),

  emptyState: style({
    padding: vars.spacing._8,
    textAlign: "center",
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.sm,
  }),
};

export const SearchResultItem = {
  root: style({
    display: "block",
    padding: vars.spacing._3,
    textDecoration: "none",
    color: vars.colors.text.primary,
    cursor: "pointer",
    selectors: {
      "&:hover": {
        background: vars.colors.background.surfaceHighlight,
      },
      "&:focus": {
        outline: "none",
        background: vars.colors.background.surfaceHighlight,
      },
      "&:not(:last-child)": {
        borderBlockEnd: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
      },
    },
  }),

  line1: style({
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._2,
    marginBlockEnd: vars.spacing._1,
  }),

  title: style({
    flex: 1,
    fontSize: vars.typography.fontSizes.sm,
    fontWeight: vars.typography.fontWeights.medium,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),

  collectionChip: style({
    flexShrink: 0,
    padding: `${vars.spacing._0_5} ${vars.spacing._2}`,
    fontSize: vars.typography.fontSizes.xs,
    borderRadius: vars.borders.radius.sm,
    background: vars.colors.background.surfaceHighlight,
    color: vars.colors.text.secondary,
    whiteSpace: "nowrap",
  }),

  line2: style({
    fontSize: vars.typography.fontSizes.xs,
    color: vars.colors.text.secondary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    marginBlockEnd: vars.spacing._1,
  }),

  line3: style({
    fontSize: vars.typography.fontSizes.xs,
    color: vars.colors.text.secondary,
    fontStyle: "italic",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
};

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
    width: `min(${vars.spacing._220}, calc(100dvw - ${vars.spacing._8}))`,
    maxHeight: `calc(var(--visual-viewport-height) - ${vars.spacing._40})`,
    display: "flex",
    flexDirection: "column",
    background: vars.colors.background.surface,
    borderRadius: vars.borders.radius.lg,
    border: 0,
    outline: "none",
    fontSize: vars.typography.fontSizes.md,
    color: vars.colors.text.primary,
    boxShadow: `0 ${vars.spacing._4} ${vars.spacing._8} rgba(from ${vars.colors.neutral._12} r g b / 0.15)`,
    overflow: "hidden",
    selectors: {
      '&[data-entering="true"]': {
        animation: `${modalSlideDown} 200ms cubic-bezier(0.16, 1, 0.3, 1)`,
      },
    },
  }),

  dialog: style({
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    outline: "none",
  }),
};

export const SearchParamsInput = {
  root: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._2,
    padding: vars.spacing._4,
  }),

  searchFieldRow: style({
    display: "flex",
    marginBlockEnd: vars.spacing._2,
  }),

  searchField: style({
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._2,
  }),

  searchIcon: style({
    flexShrink: 0,
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.lg,
  }),

  input: style({
    flex: 1,
    border: 0,
    outline: "none !important",
    background: "transparent",
    fontSize: vars.typography.fontSizes.lg,
    fontFamily: vars.typography.fontFamilies.sansSerif,
    color: vars.colors.text.primary,
    "::placeholder": {
      color: vars.colors.text.secondary,
    },
  }),

  filtersRow: style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }),

  toggleButtonGroup: style({
    display: "flex",
    gap: vars.spacing._1,
  }),

  toggleButton: style({
    paddingBlock: vars.spacing._1,
    paddingInline: vars.spacing._3,
    fontSize: vars.typography.fontSizes.sm,
    height: vars.spacing._7,
    borderRadius: vars.borders.radius.full,
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    background: "transparent",
    cursor: "pointer",
    selectors: {
      "&:hover": {
        borderColor: vars.colors.border.strong,
      },
      '&[data-selected="true"]': {
        background: vars.colors.background.inverse,
        borderColor: vars.colors.border.inverse,
        color: vars.colors.text.inverse,
      },
    },
  }),

  collectionSelect: style({
    flexShrink: 0,
    marginBlockEnd: "0 !important",
  }),

  collectionSelectButton: style({
    height: `${vars.spacing._7} !important`,
    borderRadius: vars.borders.radius.full,
    padding: `${vars.spacing._1} ${vars.spacing._3} !important`,
    fontSize: vars.typography.fontSizes.sm,
    marginBlockEnd: "0 !important",
  }),

  collectionSelectOptions: style({
    width: "auto !important",
    minWidth: "var(--trigger-width)",
  }),
};

export const SearchResults = {
  root: style({
    flex: 1,
    minHeight: 0,
    overflow: "auto",
    overscrollBehavior: "contain",
    borderBlockStart: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
  }),

  emptyState: style({
    padding: vars.spacing._8,
    textAlign: "center",
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.md,
  }),
};

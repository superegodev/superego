import { style } from "@vanilla-extract/css";
import { breakpoints, vars } from "../../../../themes.css.js";

export const History = {
  root: style({
    display: "flex",
    flexDirection: "column",
    minWidth: vars.spacing._110,
    overflowY: "auto",
    "@media": {
      [`(max-width: ${breakpoints.small})`]: {
        width: "100%",
        minWidth: "100%",
        margin: 0,
        borderRadius: 0,
      },
    },
  }),

  header: style({
    marginBlockEnd: vars.spacing._4,
    fontWeight: vars.typography.fontWeights.medium,
  }),

  loading: style({
    display: "flex",
    justifyContent: "center",
    padding: vars.spacing._8,
  }),

  error: style({
    padding: vars.spacing._4,
    color: vars.colors.semantic.error.text,
  }),

  empty: style({
    padding: vars.spacing._4,
    color: vars.colors.text.secondary,
    textAlign: "center",
    fontSize: vars.typography.fontSizes.sm,
  }),
};

export const TimelineDot = {
  root: style({
    flexShrink: 0,
    position: "relative",
    height: vars.spacing._14,
    width: vars.spacing._4,
    marginInlineEnd: vars.spacing._4,
  }),

  line: style({
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    height: vars.spacing._14,
    width: vars.borders.width.medium,
    background: vars.colors.border.default,
    selectors: {
      '&[data-position="first"]': {
        top: "75%",
        height: `calc(${vars.spacing._14} / 2)`,
      },
      '&[data-position="last"]': {
        top: "25%",
        height: `calc(${vars.spacing._14} / 2)`,
      },
    },
  }),

  dot: style({
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    height: vars.spacing._2,
    width: vars.spacing._2,
    background: vars.colors.border.default,
    borderRadius: "100%",
    transition: "all 500ms ease",
    selectors: {
      '[data-active="true"] &': {
        height: vars.spacing._4,
        width: vars.spacing._4,
        background: vars.colors.accent,
      },
    },
  }),
};

export const DocumentVersionTimelineNode = {
  root: style({
    position: "relative",
    display: "flex",
    alignItems: "flex-start",
  }),

  link: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._1,
    flexGrow: 1,
    minWidth: 0,
    height: vars.spacing._14,
    padding: vars.spacing._2,
    borderRadius: vars.borders.radius.md,
    cursor: "pointer",
    textDecoration: "none",
    color: "inherit",
    selectors: {
      '[data-active="true"] &': {
        fontWeight: vars.typography.fontWeights.bold,
      },
    },
  }),

  createdAt: style({
    fontSize: vars.typography.fontSizes.sm,
    fontWeight: vars.typography.fontWeights.medium,
    selectors: {
      '[data-active="true"] &': {
        fontWeight: vars.typography.fontWeights.bold,
      },
    },
  }),

  actions: style({
    display: "flex",
    justifyContent: "end",
    alignItems: "center",
    flexShrink: 0,
    width: vars.spacing._20,
  }),

  actionButton: style({
    height: vars.spacing._14,
    width: vars.spacing._10,
    padding: vars.spacing._2,
    fontSize: vars.typography.fontSizes.lg,
    selectors: {
      "[data-active='true'] &": {},
    },
  }),
};

export const CreatedByLine = {
  root: style({
    fontSize: vars.typography.fontSizes.xs,
    color: vars.colors.text.secondary,
  }),
};

export const BucketTimelineNode = {
  node: style({
    display: "flex",
  }),

  trigger: style({
    justifyContent: "start",
    height: vars.spacing._14,
    width: "100%",
    padding: vars.spacing._2,
    fontSize: vars.typography.fontSizes.sm,
    selectors: {
      "&:hover": {
        background: "transparent",
      },
    },
  }),

  panel: style({
    display: "flex",
    flexDirection: "column",
  }),
};

export const RestoreVersionModal = {
  restoreButtonContainer: style({
    display: "flex",
    justifyContent: "flex-end",
  }),
};

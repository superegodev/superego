import { globalStyle, style } from "@vanilla-extract/css";
import { breakpoints, vars } from "../../themes.css.js";

const headerHeight = vars.spacing._12;

export const SimpleMonthCalendar = {
  root: style({
    position: "relative",
    height: "100vh",
    width: "100%",
  }),

  grid: style({
    height: `calc(100% - ${headerHeight})`,
    width: "100%",
    tableLayout: "fixed",
    borderCollapse: "collapse",
    borderSpacing: 0,
    "@media": {
      [`(min-width: ${breakpoints.small})`]: {
        borderCollapse: "separate",
        borderSpacing: vars.spacing._1,
      },
    },
  }),

  gridHeader: style({
    height: vars.spacing._8,
  }),

  gridHeaderCell: style({
    fontSize: vars.typography.fontSizes.sm,
    fontWeight: vars.typography.fontWeights.regular,
    textTransform: "uppercase",
  }),

  gridBody: style({
    width: "100%",
  }),
};
globalStyle(`${SimpleMonthCalendar.gridBody} tr`, {
  width: "100%",
  height: "calc(100% / var(--rows))",
});
globalStyle(`${SimpleMonthCalendar.gridBody} td`, {
  padding: 0,
  border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
  "@media": {
    [`(min-width: ${breakpoints.small})`]: {
      border: 0,
    },
  },
});
globalStyle(
  `${SimpleMonthCalendar.gridBody} td:has([data-outside-month="true"])`,
  {
    border: 0,
  },
);

export const Header = {
  root: style({
    height: headerHeight,
    display: "grid",
    gridTemplateColumns: "1fr 2fr 1fr",
    alignItems: "center",
  }),

  leftSection: style({
    gridColumn: 1,
  }),

  centerSection: style({
    gridColumn: 2,
    textAlign: "center",
  }),

  rightSection: style({ gridColumn: 3 }),

  toolbar: style({
    display: "flex",
    alignItems: "center",
  }),

  heading: style({
    fontSize: vars.typography.fontSizes.xl,
    margin: 0,
  }),
};

export const DayCell = {
  root: style({
    height: "100%",
    width: "100%",
    border: 0,
    borderRadius: 0,
    background: vars.colors.background.subtleSurface,
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._1,
    padding: vars.spacing._2,
    paddingBlockStart: vars.spacing._1,
    overflow: "hidden",
    selectors: {
      '&[data-outside-month="true"]': {
        display: "none",
      },
      'tbody:has(td[aria-selected="true"]) &': {
        opacity: 0.1,
      },
      '&[data-selected="true"]': {
        opacity: "1 !important",
      },
    },
    "@media": {
      [`(min-width: ${breakpoints.small})`]: {
        border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
        borderRadius: vars.borders.radius.md,
      },
    },
  }),

  dayContainer: style({
    flexShrink: 0,
    textAlign: "center",
  }),

  day: style({
    display: "inline-block",
    lineHeight: vars.spacing._5,
    height: vars.spacing._5,
    width: vars.spacing._5,
    borderRadius: vars.borders.radius.md,
    selectors: {
      '[data-today="true"] &': {
        background: vars.colors.background.inverse,
        color: vars.colors.text.inverse,
        fontWeight: vars.typography.fontWeights.semibold,
      },
    },
  }),

  content: style({
    flexGrow: 1,
  }),
};

export const DayPopover = {
  root: style({
    position: "relative",
    minWidth: `calc(3 / 7 * 100% - ${vars.spacing._3})`,
    background: vars.colors.background.subtleSurface,
    boxShadow: `0 ${vars.spacing._2} ${vars.spacing._4} rgba(from ${vars.colors.background.inverseHighlight} r g b / 0.2)`,
    boxSizing: "content-box",
    padding: 0,
  }),

  overlayArrow: style({
    display: "block",
    fill: vars.colors.background.subtleSurface,
    stroke: vars.colors.border.default,
    strokeWidth: vars.borders.width.thin,
  }),

  overlayArrowSvg: style({
    selectors: {
      '[data-placement="right"] &': {
        transform: "rotate(90deg)",
      },
      '[data-placement="left"] &': {
        transform: "rotate(-90deg)",
      },
    },
  }),

  dialog: style({
    maxHeight: "inherit",
    overflow: "auto",
  }),

  header: style({
    position: "sticky",
    flexShrink: 0,
    top: 0,
    left: 0,
    zIndex: 9999,
    background: vars.colors.background.subtleSurface,
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBlockEnd: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    borderRadius: `${vars.borders.radius.md} ${vars.borders.radius.md} 0 0`,
    paddingInline: vars.spacing._4,
    paddingBlockStart: vars.spacing._2,
    paddingBlockEnd: vars.spacing._2,
  }),

  heading: style({
    fontSize: vars.typography.fontSizes.md,
    fontWeight: vars.typography.fontWeights.medium,
    margin: 0,
  }),

  closeButton: style({
    position: "relative",
    left: vars.spacing._2,
  }),

  content: style({
    padding: vars.spacing._4,
  }),
};

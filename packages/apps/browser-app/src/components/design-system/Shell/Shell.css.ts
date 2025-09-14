import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

const panelHeaderHeight = vars.spacing._12;
const narrowWindowWidth = "66rem";

export const Shell = {
  root: style({
    width: "100vw",
    height: "100vh",
    display: "grid",
    gridTemplateAreas: `"PrimarySidebar Main"`,
    gridTemplateColumns: `${vars.spacing._64} 1fr`,
    overflow: "hidden",
    color: vars.colors.text.primary,
    background: vars.colors.background.surface,
    position: "relative",
    transition: "margin-inline-start 200ms ease",
    selectors: {
      '&[data-primary-sidebar-open="true"]': {
        marginInlineStart: 0,
      },
    },
    "@media": {
      [`screen and (max-width: ${narrowWindowWidth})`]: {
        width: `calc(100vw + ${vars.spacing._64})`,
        gridTemplateColumns: `${vars.spacing._64} 100vw`,
        marginInlineStart: `calc(-1 * ${vars.spacing._64})`,
      },
    },
  }),
};

export const Panel = {
  root: style({
    display: "flex",
    flexDirection: "column",
    position: "relative",
    height: "100vh",
    overflowY: "scroll",
    selectors: {
      "&:not(:last-child)": {
        borderInlineEnd: `${vars.borders.width.thin} solid ${vars.colors.border.subtle}`,
      },
      '&[data-slot="PrimarySidebar"]': {
        background: vars.colors.background.secondarySurface,
      },
    },
  }),
};

export const PanelHeader = {
  root: style({
    position: "sticky",
    flexShrink: 0,
    top: 0,
    left: 0,
    zIndex: 9999,
    width: "100%",
    height: panelHeaderHeight,
    background: `
      linear-gradient(
        180deg,
        ${vars.colors.background.surface} 0%,
        ${vars.colors.background.surface} 80%,
        rgba(from ${vars.colors.background.surface} r g b / 0) 100%
      )
    `,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    selectors: {
      '[data-slot="PrimarySidebar"] &': {
        paddingInline: vars.spacing._4,
      },
      '[data-slot="Main"] &': {
        paddingInline: vars.spacing._8,
      },
    },
  }),

  leftSection: style({
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._2,
  }),

  title: style({
    fontSize: vars.typography.fontSizes.sm,
    fontWeight: vars.typography.fontWeights.medium,
  }),

  action: style({
    fontSize: vars.typography.fontSizes.xl,
  }),

  primarySidebarToggleButton: style({
    fontSize: vars.typography.fontSizes.xl2,
    padding: 0,
    display: "none !important",
    "@media": {
      [`screen and (max-width: ${narrowWindowWidth})`]: {
        display: "inline-flex !important",
      },
    },
  }),
};

export const PanelContent = {
  root: style({
    width: "100%",
    flexGrow: 1,
    selectors: {
      '[data-slot="PrimarySidebar"] &': {
        padding: vars.spacing._4,
      },
      '[data-slot="PrimarySidebar"] header + &': {
        paddingBlockStart: 0,
      },
      '[data-slot="Main"] &': {
        padding: vars.spacing._8,
      },
      '[data-slot="Main"] [data-full-width="false"]&': {
        paddingInline: `max(calc(50% - ${vars.spacing._100}), ${vars.spacing._8})`,
      },
      '[data-slot="Main"] [data-full-width="true"]&': {
        paddingInline: vars.spacing._8,
      },
      '[data-slot="Main"] header + &': {
        paddingBlockStart: vars.spacing._4,
      },
    },
  }),
};

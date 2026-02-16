import { style } from "@vanilla-extract/css";
import { breakpoints, vars } from "../../../themes.css.js";

const primarySidebarWidth = vars.spacing._64;

export const Shell = {
  root: style({
    width: "100dvw",
    height: "100dvh",
    display: "grid",
    gridTemplateAreas: `"PrimarySidebar Main"`,
    gridTemplateColumns: `${primarySidebarWidth} 1fr`,
    overflow: "hidden",
    color: vars.colors.text.primary,
    background: vars.colors.background.surface,
    position: "relative",
    selectors: {
      '&[data-primary-sidebar-open="true"]': {
        marginInlineStart: 0,
      },
      '&[data-primary-sidebar-collapse="Always"]': {
        width: `calc(100dvw + ${primarySidebarWidth})`,
        gridTemplateColumns: `${primarySidebarWidth} 100dvw`,
        marginInlineStart: `calc(-1 * ${primarySidebarWidth})`,
      },
      '&[data-primary-sidebar-collapse="Always"][data-primary-sidebar-open="true"]':
        {
          marginInlineStart: 0,
        },
    },
    "@media": {
      "(prefers-reduced-motion: no-preference)": {
        transition: "margin-inline-start 200ms ease",
      },
      [`(max-width: ${breakpoints.medium})`]: {
        width: `calc(100dvw + ${primarySidebarWidth})`,
        gridTemplateColumns: `${primarySidebarWidth} 100dvw`,
        marginInlineStart: `calc(-1 * ${primarySidebarWidth})`,
      },
    },
  }),
};

export const Panel = {
  root: style({
    display: "flex",
    flexDirection: "column",
    position: "relative",
    height: "100dvh",
    overflow: "auto",
    selectors: {
      "&:not(:last-child)": {
        borderInlineEnd: `${vars.borders.width.thin} solid ${vars.colors.border.subtle}`,
      },
      '&[data-slot="PrimarySidebar"]': {
        height: "100dvh",
        overflow: "hidden",
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
    height: vars.shell.panelHeaderHeight,
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
    overflow: "hidden",
  }),

  title: style({
    fontSize: vars.typography.fontSizes.md,
    fontWeight: vars.typography.fontWeights.medium,
    textWrap: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),

  actionsToolbar: style({
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
  }),

  action: style({
    width: vars.spacing._8,
    height: vars.spacing._8,
    fontSize: `${vars.typography.fontSizes.xl} !important`,
  }),

  activeActionMenuItem: style({
    background: vars.colors.background.inverse,
    color: `${vars.colors.text.inverse} !important`,
    selectors: {
      "&:hover": {
        background: `${vars.colors.background.inverse} !important`,
        color: `${vars.colors.text.inverse} !important`,
      },
    },
  }),

  actionsSeparator: style({
    display: "inline-block",
    background: vars.colors.border.default,
    height: vars.spacing._4,
    width: vars.borders.width.thin,
    marginInline: vars.spacing._2,
  }),

  primarySidebarToggleButton: style({
    fontSize: `${vars.typography.fontSizes.xl2} !important`,
    padding: 0,
    display: "none !important",
    selectors: {
      '[data-primary-sidebar-collapse="Always"] &': {
        display: "inline-flex !important",
      },
    },
    "@media": {
      [`(max-width: ${breakpoints.medium})`]: {
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
        paddingInline: `max(calc(50% - ${vars.spacing._110}), ${vars.spacing._8})`,
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

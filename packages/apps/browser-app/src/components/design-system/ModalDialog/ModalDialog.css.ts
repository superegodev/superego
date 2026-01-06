import { keyframes, style } from "@vanilla-extract/css";
import { dark, light, vars } from "../../../themes.css.js";

const modalOverlayFade = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const modalZoom = keyframes({
  from: { transform: "scale(0.8)" },
  to: { transform: "scale(1)" },
});

export const ModalDialog = {
  overlay: style({
    position: "fixed",
    top: 0,
    left: 0,
    width: "100dvw",
    height: "var(--visual-viewport-height)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    backdropFilter: "blur(0.5px)",
    selectors: {
      [`${light} &`]: {
        background: `rgb(from ${vars.colors.background.inverse} r g b / .3)`,
      },
      [`${dark} &`]: {
        background: `rgb(from ${vars.colors.background.inverse} r g b / .2)`,
      },
      '&[data-entering="true"]': {
        animation: `${modalOverlayFade} 200ms`,
      },
      '&[data-exiting="true"]': {
        animation: `${modalOverlayFade} 150ms reverse ease-in`,
      },
    },
  }),
  modal: style({
    minWidth: vars.spacing._100,
    maxWidth: `min(${vars.spacing._120}, calc(100dvw - ${vars.spacing._8}))`,
    background: vars.colors.background.surface,
    padding: vars.spacing._4,
    borderRadius: vars.borders.radius.md,
    border: 0,
    outline: "none",
    fontSize: vars.typography.fontSizes.md,
    color: vars.colors.text.primary,
    boxShadow: `0 ${vars.spacing._2} ${vars.spacing._4} rgba(from ${vars.colors.neutral._12} r g b / 0.1)`,
    selectors: {
      '&[data-entering="true"]': {
        animation: `${modalZoom} 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`,
      },
    },
  }),
};

export const Heading = {
  root: style({
    width: `calc(100% + ${vars.spacing._8})`,
    marginInline: `calc(${vars.spacing._4} * -1)`,
    marginBlockStart: 0,
    marginBlockEnd: vars.spacing._4,
    paddingInline: vars.spacing._4,
    paddingBlockEnd: vars.spacing._4,
    fontSize: vars.typography.fontSizes.lg,
    fontWeight: vars.typography.fontWeights.medium,
    borderBlockEndWidth: vars.borders.width.thin,
    borderBlockEndColor: vars.colors.border.default,
    borderBlockEndStyle: "solid",
  }),
};

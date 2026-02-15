import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const ExcalidrawInput = {
  root: style({
    width: "100%",
    height: vars.spacing._120,
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
    overflow: "hidden",
    selectors: {
      '&[data-has-focus="true"][data-focus-visible="true"]': {
        outline: `2px solid ${vars.colors.accent}`,
        outlineOffset: "-1px",
      },
      '&[data-invalid="true"]': {
        borderColor: vars.colors.semantic.error.border,
      },
      '&[data-full-screen="true"]': {
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        zIndex: 9999,
        border: "none",
        borderRadius: 0,
      },
    },
  }),

  fullScreenButton: style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "2.25rem",
    height: "2.25rem",
    borderRadius: "0.5rem",
    border: "none",
    backgroundColor: "#ececf4",
    cursor: "pointer",
    fontSize: "1rem",
    color: "#1b1b2f",
    padding: 0,
  }),
};

globalStyle(`${ExcalidrawInput.root} .sidebar-trigger`, {
  display: "none !important",
});

globalStyle(`${ExcalidrawInput.root} .sidebar__header`, {
  display: "none !important",
});

globalStyle(`${ExcalidrawInput.root} .layer-ui__search`, {
  padding: "0 !important",
});

globalStyle(`${ExcalidrawInput.root} .help-icon`, {
  display: "none !important",
});

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
    },
  }),
};

globalStyle(`${ExcalidrawInput.root} .sidebar-trigger`, {
  display: "none",
});

globalStyle(`${ExcalidrawInput.root} .sidebar__header`, {
  display: "none",
});

globalStyle(`${ExcalidrawInput.root} .layer-ui__search`, {
  padding: 0,
});

globalStyle(`${ExcalidrawInput.root} .help-icon`, {
  display: "none",
});

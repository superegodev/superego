import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const GeoJSONInput = {
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
      '&[aria-invalid="true"]': {
        borderColor: vars.colors.semantic.error.border,
      },
    },
  }),

  map: style({
    width: "100%",
    height: "100%",
  }),
};

// Hide Geoman's controls until the map is loaded and hovered.
globalStyle(`${GeoJSONInput.map} .maplibregl-control-container`, {
  opacity: 0,
  pointerEvents: "none",
  transition: "opacity 150ms ease-in-out",
});
globalStyle(
  `${GeoJSONInput.root}:hover ${GeoJSONInput.map}[data-loaded="true"] .maplibregl-control-container`,
  { opacity: 1, pointerEvents: "auto" },
);

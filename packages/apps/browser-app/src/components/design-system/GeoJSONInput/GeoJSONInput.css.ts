import { style } from "@vanilla-extract/css";
import { dark, vars } from "../../../themes.css.js";

export const GeoJSONInput = {
  root: style({
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
    overflow: "hidden",
    background: vars.colors.background.surface,
    selectors: {
      '&[data-invalid="true"]': {
        borderColor: vars.colors.semantic.error.border,
      },
      [`${dark} &`]: {
        background: vars.colors.background.surface,
      },
    },
  }),
  map: style({
    width: "100%",
    height: "240px",
    background: vars.colors.background.surfaceHighlight,
    selectors: {
      [`${dark} &`]: {
        background: vars.colors.background.surfaceHighlight,
      },
    },
  }),
};

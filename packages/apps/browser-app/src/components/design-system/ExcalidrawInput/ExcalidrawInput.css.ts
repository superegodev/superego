import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const ExcalidrawInput = {
  root: style({
    width: "100%",
    height: "400px",
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
    overflow: "hidden",
    selectors: {
      '&[data-invalid="true"]': {
        borderColor: vars.colors.semantic.error.border,
      },
    },
  }),
};

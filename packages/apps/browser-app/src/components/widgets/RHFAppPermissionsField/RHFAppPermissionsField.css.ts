import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const RHFAppPermissionsField = {
  fieldset: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._2,
    border: 0,
    padding: 0,
  }),
  destination: style({
    display: "flex",
    gap: vars.spacing._2,
    alignItems: "center",
  }),
  origin: style({
    flexGrow: 1,
    minWidth: 0,
    font: "inherit",
    padding: vars.spacing._2,
    border: `1px solid ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
  }),
};

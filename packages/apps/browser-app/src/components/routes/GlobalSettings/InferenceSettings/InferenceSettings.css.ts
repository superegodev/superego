import { style } from "@vanilla-extract/css";
import { vars } from "../../../../themes.css.js";

export const InferenceSettings = {
  info: style({
    marginBlockStart: 0,
  }),

  addButton: style({
    display: "flex",
    gap: vars.spacing._1,
    width: "100%",
    borderStyle: "dashed",
  }),
};

export const Provider = {
  root: style({
    padding: vars.spacing._4,
    borderRadius: vars.borders.radius.md,
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
  }),

  providerRow: style({
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: vars.spacing._2,
  }),

  modelsFields: style({
    gap: vars.spacing._2,
  }),

  addButton: style({
    display: "flex",
    gap: vars.spacing._1,
    width: "100%",
    borderStyle: "dashed",
  }),
};

export const Model = {
  row: style({
    display: "flex",
    flexDirection: "row",
    gap: vars.spacing._6,
    alignItems: "center",
  }),

  nameField: style({
    flex: 1,
  }),

  deleteButton: style({
    fontSize: vars.typography.fontSizes.xl,
    height: `calc(${vars.spacing._9} + 1px)`,
    width: `calc(${vars.spacing._9} + 1px)`,
  }),
};

export const Capabilities = {
  root: style({
    display: "flex",
    flexDirection: "row",
    gap: vars.spacing._1,
  }),

  button: style({
    fontSize: vars.typography.fontSizes.xl,
    height: `calc(${vars.spacing._9} + 1px)`,
    width: `calc(${vars.spacing._9} + 1px)`,
  }),
};

import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const PackCard = {
  root: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._4,
    width: "100%",
    height: "100%",
    padding: vars.spacing._4,
    textDecoration: "none",
    color: vars.colors.text.primary,
    borderRadius: vars.borders.radius.md,
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    selectors: {
      "&:hover": {
        background: vars.colors.background.surfaceHighlight,
      },
      "&:focus": {
        outline: "none",
        background: vars.colors.background.surfaceHighlight,
      },
    },
  }),

  screenshot: style({
    width: "100%",
    aspectRatio: "16 / 9",
    borderRadius: vars.borders.radius.md,
    objectFit: "cover",
    objectPosition: "left top",
  }),

  text: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._2,
    minHeight: 0,
  }),

  name: style({
    marginBlockEnd: vars.spacing._2,
  }),

  shortDescription: style({
    margin: 0,
    fontSize: vars.typography.fontSizes.md,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: "3",
    WebkitBoxOrient: "vertical",
  }),
};

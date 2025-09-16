import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

const pulse = keyframes({
  "0%, 100%": { opacity: 0.4 },
  "50%": { opacity: 1 },
});

export const ListSkeleton = {
  root: style({
    width: "100%",
    display: "flex",
    flexDirection: "column",
  }),
  item: style({
    background: vars.colors.background.surfaceHighlight,
    animation: `${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
    borderRadius: vars.borders.radius.sm,
  }),
};

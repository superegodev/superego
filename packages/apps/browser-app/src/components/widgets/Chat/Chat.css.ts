import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const Chat = {
  root: style({
    flexGrow: 1,
    display: "flex",
    flexDirection: "column-reverse",
    paddingBlockEnd: "0 !important",
  }),

  messages: style({
    flexGrow: 1,
  }),

  userMessageContentInputContainer: style({
    position: "sticky",
    paddingBlockStart: vars.spacing._4,
    paddingBlockEnd: vars.spacing._8,
    bottom: 0,
    flex: "0 0 auto",
    zIndex: 99,
    background: `
      linear-gradient(
        0deg,
        ${vars.colors.background.surface} 0%,
        ${vars.colors.background.surface} calc(100% - ${vars.spacing._4}),
        rgb(from ${vars.colors.background.surface} r g b / 0) 100%
      )
    `,
  }),
};

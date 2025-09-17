import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const FactotumConversation = {
  panelContent: style({
    display: "flex",
    flexDirection: "column-reverse",
    paddingBlockEnd: "0 !important",
  }),
};

export const Chat = {
  messages: style({
    flexGrow: 1,
  }),

  userMessageContentInputContainer: style({
    position: "sticky",
    paddingBlockStart: vars.spacing._4,
    paddingBlockEnd: vars.spacing._8,
    bottom: 0,
    flex: "0 0 auto",
    zIndex: 1,
    background: `
      linear-gradient(
        0deg,
        ${vars.colors.background.surface} 0%,
        ${vars.colors.background.surface} 90%,
        rgba(from ${vars.colors.background.surface} r g b / 0) 100%
      )
    `,
  }),
};

export const DeleteConversationModalForm = {
  submitButtonContainer: style({
    display: "flex",
    justifyContent: "flex-end",
  }),
};

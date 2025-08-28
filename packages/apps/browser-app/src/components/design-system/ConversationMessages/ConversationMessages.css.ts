import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const ConversationMessages = {
  root: style({
    width: "100%",
    overflow: "scroll",
  }),
};

export const UserMessage = {
  root: style({
    background: vars.colors.blues._2, // TEMP
  }),
};

export const ToolMessage = {
  root: style({
    background: vars.colors.cyans._2, // TEMP
  }),
};

export const AssistantContentMessage = {
  root: style({
    background: vars.colors.oranges._2, // TEMP
  }),
};

export const AssistantToolCallMessage = {
  root: style({
    background: vars.colors.reds._2, // TEMP
  }),
};

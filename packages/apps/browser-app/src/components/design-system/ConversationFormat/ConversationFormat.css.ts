import { ConversationFormat as ConversationFormatB } from "@superego/backend";
import { style, styleVariants } from "@vanilla-extract/css";

const conversationFormatRootBase = style({});
export const ConversationFormat = {
  root: styleVariants({
    [ConversationFormatB.Text]: [conversationFormatRootBase, {}],
    [ConversationFormatB.Voice]: [conversationFormatRootBase, {}],
  }),
};

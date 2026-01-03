import type Conversation from "./Conversation.js";

type LiteConversation = Omit<Conversation, "messages">;
export default LiteConversation;

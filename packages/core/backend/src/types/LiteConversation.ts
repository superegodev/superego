import type Conversation from "./Conversation.js";

type LiteConversation = Omit<Conversation, "nodes">;
export default LiteConversation;

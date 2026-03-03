import type { Conversation, ConversationId } from "@superego/backend";

export default class LiveConversationStore {
  private store = new Map<ConversationId, Conversation>();

  get(id: ConversationId): Conversation | null {
    return this.store.get(id) ?? null;
  }

  set(id: ConversationId, conversation: Conversation): void {
    this.store.set(id, conversation);
  }

  delete(id: ConversationId): void {
    this.store.delete(id);
  }
}

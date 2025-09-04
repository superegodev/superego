import type { ConversationId } from "@superego/backend";
import type ConversationEntity from "../entities/ConversationEntity.js";

export default interface ConversationRepository {
  upsert(conversation: ConversationEntity): Promise<void>;
  delete(id: ConversationId): Promise<ConversationId>;
  exists(id: ConversationId): Promise<boolean>;
  find(id: ConversationId): Promise<ConversationEntity | null>;
  findAll(): Promise<ConversationEntity[]>;
}

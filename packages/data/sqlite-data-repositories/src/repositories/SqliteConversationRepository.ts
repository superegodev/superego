import type { DatabaseSync } from "node:sqlite";
import type { ConversationId } from "@superego/backend";
import type {
  ConversationEntity,
  ConversationRepository,
} from "@superego/executing-backend";
import type SqliteConversation from "../types/SqliteConversation.js";
import { toEntity } from "../types/SqliteConversation.js";

const table = "conversations";

export default class SqliteConversationRepository
  implements ConversationRepository
{
  constructor(private db: DatabaseSync) {}

  async upsert(conversation: ConversationEntity): Promise<void> {
    this.db
      .prepare(`
        INSERT INTO "${table}"
          (
            "id",
            "type",
            "title",
            "messages",
            "is_generating_next_message",
            "next_message_generation_error",
            "created_at"
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT("id") DO UPDATE SET
          "type" = excluded."type",
          "title" = excluded."title",
          "messages" = excluded."messages",
          "is_generating_next_message" = excluded."is_generating_next_message",
          "next_message_generation_error" = excluded."next_message_generation_error",
          "created_at" = excluded."created_at"
      `)
      .run(
        conversation.id,
        conversation.type,
        conversation.title,
        JSON.stringify(conversation.messages),
        conversation.isGeneratingNextMessage ? 1 : 0,
        conversation.nextMessageGenerationError,
        conversation.createdAt.toISOString(),
      );
  }

  async delete(id: ConversationId): Promise<ConversationId> {
    this.db.prepare(`DELETE FROM "${table}" WHERE "id" = ?`).run(id);
    return id;
  }

  async find(id: ConversationId): Promise<ConversationEntity | null> {
    const conversation = this.db
      .prepare(`SELECT * FROM "${table}" WHERE "id" = ?`)
      .get(id) as SqliteConversation | undefined;
    return conversation ? toEntity(conversation) : null;
  }

  async findAll(): Promise<ConversationEntity[]> {
    const conversations = this.db
      .prepare(`SELECT * FROM "${table}" ORDER BY "created_at" DESC`)
      .all() as any as SqliteConversation[];
    return conversations.map(toEntity);
  }
}

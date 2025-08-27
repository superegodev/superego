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
            "assistant",
            "format",
            "title",
            "context_fingerprint",
            "messages",
            "is_completed",
            "created_at"
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT("id") DO UPDATE SET
          "assistant" = excluded."assistant",
          "format" = excluded."format",
          "title" = excluded."title",
          "context_fingerprint" = excluded."context_fingerprint",
          "messages" = excluded."messages",
          "is_completed" = excluded."is_completed",
          "created_at" = excluded."created_at"
      `)
      .run(
        conversation.id,
        conversation.assistant,
        conversation.format,
        conversation.title,
        conversation.contextFingerprint,
        JSON.stringify(conversation.messages),
        conversation.isCompleted ? 1 : 0,
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

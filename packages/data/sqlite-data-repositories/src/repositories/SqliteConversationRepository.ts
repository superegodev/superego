import type { DatabaseSync } from "node:sqlite";
import { encode } from "@msgpack/msgpack";
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
            "title",
            "context_fingerprint",
            "messages",
            "status",
            "error",
            "created_at"
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT("id") DO UPDATE SET
          "assistant" = excluded."assistant",
          "title" = excluded."title",
          "context_fingerprint" = excluded."context_fingerprint",
          "messages" = excluded."messages",
          "status" = excluded."status",
          "error" = excluded."error",
          "created_at" = excluded."created_at"
      `)
      .run(
        conversation.id,
        conversation.assistant,
        conversation.title,
        conversation.contextFingerprint,
        encode(conversation.messages),
        conversation.status,
        conversation.error ? JSON.stringify(conversation.error) : null,
        conversation.createdAt.toISOString(),
      );
  }

  async delete(id: ConversationId): Promise<ConversationId> {
    this.db.prepare(`DELETE FROM "${table}" WHERE "id" = ?`).run(id);
    return id;
  }

  async exists(id: ConversationId): Promise<boolean> {
    const result = this.db
      .prepare(`SELECT 1 FROM "${table}" WHERE "id" = ?`)
      .get(id) as 1 | undefined;
    return result !== undefined;
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
      .all() as SqliteConversation[];
    return conversations.map(toEntity);
  }
}

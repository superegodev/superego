import { encode } from "@msgpack/msgpack";
import type { ConversationId } from "@superego/backend";
import type {
  ConversationEntity,
  ConversationRepository,
} from "@superego/executing-backend";
import type TursoDatabase from "../TursoDatabase.js";
import type TursoConversation from "../types/TursoConversation.js";
import { toEntity } from "../types/TursoConversation.js";

const table = "conversations";

export default class TursoConversationRepository implements ConversationRepository {
  constructor(private db: TursoDatabase) {}

  async upsert(conversation: ConversationEntity): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO "${table}"
          (
            "id",
            "assistant",
            "title",
            "context_fingerprint",
            "messages",
            "status",
            "processing_started_at",
            "error",
            "created_at"
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT("id") DO UPDATE SET
          "assistant" = excluded."assistant",
          "title" = excluded."title",
          "context_fingerprint" = excluded."context_fingerprint",
          "messages" = excluded."messages",
          "status" = excluded."status",
          "processing_started_at" = excluded."processing_started_at",
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
        conversation.processingStartedAt?.toISOString() ?? null,
        conversation.error ? JSON.stringify(conversation.error) : null,
        conversation.createdAt.toISOString(),
      );
  }

  async delete(id: ConversationId): Promise<ConversationId> {
    await this.db.prepare(`DELETE FROM "${table}" WHERE "id" = ?`).run(id);
    return id;
  }

  async exists(id: ConversationId): Promise<boolean> {
    const result = (await this.db
      .prepare(`SELECT 1 FROM "${table}" WHERE "id" = ?`)
      .get(id)) as 1 | undefined;
    return result !== undefined;
  }

  async find(id: ConversationId): Promise<ConversationEntity | null> {
    const conversation = (await this.db
      .prepare(`SELECT * FROM "${table}" WHERE "id" = ?`)
      .get(id)) as TursoConversation | undefined;
    return conversation ? toEntity(conversation) : null;
  }

  async findAll(): Promise<ConversationEntity[]> {
    const conversations = (await this.db
      .prepare(`SELECT * FROM "${table}" ORDER BY "created_at" DESC`)
      .all()) as TursoConversation[];
    return conversations.map(toEntity);
  }
}

import type { DatabaseSync } from "node:sqlite";
import type { BackgroundJobId } from "@superego/backend";
import type {
  BackgroundJobEntity,
  BackgroundJobRepository,
} from "@superego/executing-backend";
import type SqliteBackgroundJob from "../types/SqliteBackgroundJob.js";
import { toEntity } from "../types/SqliteBackgroundJob.js";

const table = "background_jobs";

export default class SqliteBackgroundJobRepository
  implements BackgroundJobRepository
{
  constructor(private db: DatabaseSync) {}

  async insert(backgroundJob: BackgroundJobEntity): Promise<void> {
    this.db
      .prepare(`
        INSERT INTO "${table}"
          (
            "id",
            "name",
            "input",
            "status",
            "enqueued_at",
            "started_processing_at" ,
            "finished_processing_at",
            "error"
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        backgroundJob.id,
        backgroundJob.name,
        JSON.stringify(backgroundJob.input),
        backgroundJob.status,
        backgroundJob.enqueuedAt.toISOString(),
        backgroundJob.startedProcessingAt?.toISOString() ?? null,
        backgroundJob.finishedProcessingAt?.toISOString() ?? null,
        backgroundJob.error ? JSON.stringify(backgroundJob.error) : null,
      );
  }

  async replace(backgroundJob: BackgroundJobEntity): Promise<void> {
    this.db
      .prepare(`
        UPDATE "${table}"
        SET
          "name" = ?,
          "input" = ?,
          "status" = ?,
          "enqueued_at" = ?,
          "started_processing_at"  = ?,
          "finished_processing_at" = ?,
          "error" = ?
        WHERE "id" = ?
      `)
      .run(
        backgroundJob.name,
        JSON.stringify(backgroundJob.input),
        backgroundJob.status,
        backgroundJob.enqueuedAt.toISOString(),
        backgroundJob.startedProcessingAt?.toISOString() ?? null,
        backgroundJob.finishedProcessingAt?.toISOString() ?? null,
        backgroundJob.error ? JSON.stringify(backgroundJob.error) : null,
        backgroundJob.id,
      );
  }

  async find(id: BackgroundJobId): Promise<BackgroundJobEntity | null> {
    const backgroundJob = this.db
      .prepare(`SELECT * FROM "${table}" WHERE "id" = ?`)
      .get(id) as SqliteBackgroundJob | undefined;
    return backgroundJob ? toEntity(backgroundJob) : null;
  }

  async findAll(): Promise<BackgroundJobEntity[]> {
    const backgroundJobs = this.db
      .prepare(`SELECT * FROM "${table}" ORDER BY "name" ASC`)
      .all() as any as SqliteBackgroundJob[];
    return backgroundJobs.map(toEntity);
  }
}

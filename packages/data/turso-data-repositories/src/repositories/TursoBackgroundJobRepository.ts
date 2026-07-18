import { type BackgroundJobId, BackgroundJobStatus } from "@superego/backend";
import type {
  BackgroundJobEntity,
  BackgroundJobRepository,
} from "@superego/executing-backend";
import type TursoDatabase from "../TursoDatabase.js";
import type TursoBackgroundJob from "../types/TursoBackgroundJob.js";
import { toEntity } from "../types/TursoBackgroundJob.js";

const table = "background_jobs";

export default class TursoBackgroundJobRepository implements BackgroundJobRepository {
  constructor(private db: TursoDatabase) {}

  async insert(backgroundJob: BackgroundJobEntity): Promise<void> {
    await this.db
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
    await this.db
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
    const backgroundJob = (await this.db
      .prepare(`SELECT * FROM "${table}" WHERE "id" = ?`)
      .get(id)) as TursoBackgroundJob | undefined;
    return backgroundJob ? toEntity(backgroundJob) : null;
  }

  async findWhereStatusEqProcessing(): Promise<
    (BackgroundJobEntity & { status: BackgroundJobStatus.Processing }) | null
  > {
    const backgroundJob = (await this.db
      .prepare(
        `SELECT * FROM "${table}" WHERE "status" = '${BackgroundJobStatus.Processing}'`,
      )
      .get()) as TursoBackgroundJob | undefined;
    return backgroundJob
      ? (toEntity(backgroundJob) as BackgroundJobEntity & {
          status: BackgroundJobStatus.Processing;
        })
      : null;
  }

  async findOldestWhereStatusEqEnqueued(): Promise<
    (BackgroundJobEntity & { status: BackgroundJobStatus.Enqueued }) | null
  > {
    const backgroundJob = (await this.db
      .prepare(
        `SELECT * FROM "${table}" WHERE "status" = '${BackgroundJobStatus.Enqueued}' ORDER BY "enqueued_at" ASC`,
      )
      .get()) as TursoBackgroundJob | undefined;
    return backgroundJob
      ? (toEntity(backgroundJob) as BackgroundJobEntity & {
          status: BackgroundJobStatus.Enqueued;
        })
      : null;
  }

  async findAll(): Promise<BackgroundJobEntity[]> {
    const backgroundJobs = (await this.db
      .prepare(`SELECT * FROM "${table}" ORDER BY "enqueued_at" DESC`)
      .all()) as TursoBackgroundJob[];
    return backgroundJobs.map(toEntity);
  }
}

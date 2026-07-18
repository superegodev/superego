import type { GlobalSettings } from "@superego/backend";
import type {
  DataRepositories,
  DataRepositoriesManager,
} from "@superego/executing-backend";
import migrate from "./migrations/migrate.js";
import TursoConversationTextSearchIndex from "./repositories/TursoConversationTextSearchIndex.js";
import TursoDocumentTextSearchIndex from "./repositories/TursoDocumentTextSearchIndex.js";
import toTursoLockedError from "./toTursoLockedError.js";
import TursoDatabase from "./TursoDatabase.js";
import TursoDataRepositories from "./TursoDataRepositories.js";

/**
 * Browser/Electron-renderer data repositories backed by Turso WASM and OPFS.
 */
export default class TursoDataRepositoriesManager implements DataRepositoriesManager {
  private migrationPromise: Promise<void> | null = null;
  private searchTextIndexStates = {
    conversation: TursoConversationTextSearchIndex.getSearchTextIndexState(),
    document: TursoDocumentTextSearchIndex.getSearchTextIndexState(),
  };

  constructor(
    private options: {
      /** OPFS file name, not an operating-system file path. */
      fileName: string;
      defaultGlobalSettings: GlobalSettings;
      /** Busy timeout in milliseconds. */
      timeout?: number;
      /** @internal Only used for tests. */
      enableForeignKeyConstraints?: boolean;
    },
  ) {}

  async runInSerializableTransaction<ReturnValue>(
    fn: (
      repos: DataRepositories,
    ) => Promise<{ action: "commit" | "rollback"; returnValue: ReturnValue }>,
  ): Promise<ReturnValue> {
    if (this.migrationPromise) {
      await this.migrationPromise;
    }
    const transactionSucceededCallbacks: (() => void)[] = [];
    const db = await this.openDb();
    try {
      await db.exec("BEGIN");
      const repos = new TursoDataRepositories(
        db,
        this.options.defaultGlobalSettings,
        this.searchTextIndexStates,
        (callback) => transactionSucceededCallbacks.push(callback),
      );
      const { action, returnValue } = await fn(repos);
      await db.exec(action === "commit" ? "COMMIT" : "ROLLBACK");
      if (action === "commit") {
        TursoDataRepositoriesManager.runTransactionSucceededCallbacks(
          transactionSucceededCallbacks,
        );
      }
      return returnValue;
    } catch (error) {
      if (db.isTransaction) {
        await db.exec("ROLLBACK");
      }
      throw toTursoLockedError(error);
    } finally {
      await db.close();
    }
  }

  runMigrations(): Promise<void> {
    this.migrationPromise ??= this.doRunMigrations();
    return this.migrationPromise;
  }

  /** @internal Only used by the repository conformance tests. */
  async resetForTests(): Promise<void> {
    if (this.migrationPromise) {
      await this.migrationPromise;
    }
    const db = await this.openDb();
    try {
      await db.exec("BEGIN IMMEDIATE");
      await db.exec(`
        DELETE FROM "document_version_content_blocking_keys";
        DELETE FROM "document_versions";
        DELETE FROM "documents";
        DELETE FROM "collection_versions";
        DELETE FROM "collections";
        DELETE FROM "collection_categories";
        DELETE FROM "app_versions";
        DELETE FROM "apps";
        DELETE FROM "conversation_text_search_texts";
        DELETE FROM "conversations";
        DELETE FROM "background_jobs";
        DELETE FROM "files";
        DELETE FROM "document_text_search_texts";
        DELETE FROM "singleton__global_settings";
      `);
      await db.exec("COMMIT");
      this.searchTextIndexStates = {
        conversation:
          TursoConversationTextSearchIndex.getSearchTextIndexState(),
        document: TursoDocumentTextSearchIndex.getSearchTextIndexState(),
      };
    } catch (error) {
      if (db.isTransaction) {
        await db.exec("ROLLBACK");
      }
      throw toTursoLockedError(error);
    } finally {
      await db.close();
    }
  }

  private async doRunMigrations(): Promise<void> {
    const db = await this.openDb();
    try {
      await migrate(db);
    } catch (error) {
      if (db.isTransaction) {
        await db.exec("ROLLBACK");
      }
      throw toTursoLockedError(error);
    } finally {
      await db.close();
    }
  }

  private async openDb(): Promise<TursoDatabase> {
    const {
      fileName,
      timeout,
      enableForeignKeyConstraints = true,
    } = this.options;
    const db = await TursoDatabase.open(fileName, { timeout });
    try {
      await db.exec(
        `PRAGMA foreign_keys = ${enableForeignKeyConstraints ? "ON" : "OFF"}`,
      );
      await db.exec("PRAGMA journal_mode = WAL");
      await db.exec("PRAGMA synchronous = FULL");
      return db;
    } catch (error) {
      await db.close();
      throw toTursoLockedError(error);
    }
  }

  private static runTransactionSucceededCallbacks(callbacks: (() => void)[]) {
    callbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error(
          "Uncaught error running transaction succeeded callback",
          error,
        );
      }
    });
  }
}

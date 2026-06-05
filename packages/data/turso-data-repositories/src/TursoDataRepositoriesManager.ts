import type { GlobalSettings } from "@superego/backend";
import type {
  DataRepositories,
  DataRepositoriesManager,
} from "@superego/executing-backend";
import { connect } from "@tursodatabase/database-wasm/bundle";
import AsyncSqliteDatabase from "./AsyncSqliteDatabase.js";
import migrate from "./migrations/migrate.js";
import SqliteConversationTextSearchIndex from "./repositories/SqliteConversationTextSearchIndex.js";
import SqliteDocumentTextSearchIndex from "./repositories/SqliteDocumentTextSearchIndex.js";
import SqliteDataRepositories from "./SqliteDataRepositories.js";

export default class TursoDataRepositoriesManager implements DataRepositoriesManager {
  private migrationsPromise: Promise<void> | null = null;

  private searchTextIndexStates = {
    conversation: SqliteConversationTextSearchIndex.getSearchTextIndexState(),
    document: SqliteDocumentTextSearchIndex.getSearchTextIndexState(),
  };

  constructor(
    private options: {
      fileName: string;
      defaultGlobalSettings: GlobalSettings;
    },
  ) {}

  async runInSerializableTransaction<ReturnValue>(
    fn: (
      repos: DataRepositories,
    ) => Promise<{ action: "commit" | "rollback"; returnValue: ReturnValue }>,
  ): Promise<ReturnValue> {
    await this.migrationsPromise;
    const transactionSucceededCallbacks: (() => void)[] = [];
    const db = await this.openDb();
    await db.exec("BEGIN");
    const repos = new SqliteDataRepositories(
      db as never,
      this.options.defaultGlobalSettings,
      this.searchTextIndexStates,
      (callback) => {
        transactionSucceededCallbacks.push(callback);
      },
    );
    try {
      const { action, returnValue } = await fn(repos);
      await db.exec(action === "commit" ? "COMMIT" : "ROLLBACK");
      if (action === "commit") {
        TursoDataRepositoriesManager.runTransactionSucceededCallbacks(
          transactionSucceededCallbacks,
        );
      }
      return returnValue;
    } catch (error) {
      if (db.inTransaction) {
        await db.exec("ROLLBACK");
      }
      throw error;
    } finally {
      await db.close();
    }
  }

  runMigrations(): void {
    this.migrationsPromise = this.runMigrationsAsync();
  }

  private async runMigrationsAsync(): Promise<void> {
    const db = await this.openDb();
    try {
      await migrate(db);
    } finally {
      await db.close();
    }
  }

  private async openDb(): Promise<AsyncSqliteDatabase> {
    const db = new AsyncSqliteDatabase(await connect(this.options.fileName));
    await db.exec("PRAGMA journal_mode = WAL");
    await db.exec("PRAGMA synchronous = FULL");
    await db.exec("PRAGMA busy_timeout = 0");
    return db;
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

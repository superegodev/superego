import { DatabaseSync } from "node:sqlite";
import type { GlobalSettings } from "@superego/backend";
import type {
  DataRepositories,
  DataRepositoriesManager,
} from "@superego/executing-backend";
import migrate from "./migrations/migrate.js";
import SqliteConversationTextSearchIndex from "./repositories/SqliteConversationTextSearchIndex.js";
import SqliteDocumentTextSearchIndex from "./repositories/SqliteDocumentTextSearchIndex.js";
import SqliteDataRepositories from "./SqliteDataRepositories.js";

export default class SqliteDataRepositoriesManager implements DataRepositoriesManager {
  private searchTextIndexStates = {
    conversation: SqliteConversationTextSearchIndex.getSearchTextIndexState(),
    document: SqliteDocumentTextSearchIndex.getSearchTextIndexState(),
  };

  constructor(
    private options: {
      fileName: string;
      defaultGlobalSettings: GlobalSettings;
      /** @internal Only used for tests. */
      enableForeignKeyConstraints?: boolean;
    },
  ) {}

  async runInSerializableTransaction<ReturnValue>(
    fn: (
      repos: DataRepositories,
    ) => Promise<{ action: "commit" | "rollback"; returnValue: ReturnValue }>,
  ): Promise<ReturnValue> {
    const transactionSucceededCallbacks: (() => void)[] = [];
    let db: DatabaseSync | null = null;
    try {
      db = this.openDb();
      db.exec("BEGIN");
      const repos = new SqliteDataRepositories(
        db,
        this.options.defaultGlobalSettings,
        this.searchTextIndexStates,
        (callback) => transactionSucceededCallbacks.push(callback),
      );
      const { action, returnValue } = await fn(repos);
      db.exec(action === "commit" ? "COMMIT" : "ROLLBACK");
      if (action === "commit") {
        SqliteDataRepositoriesManager.runTransactionSucceededCallbacks(
          transactionSucceededCallbacks,
        );
      }
      return returnValue;
    } catch (error) {
      if (db?.isTransaction) {
        db.exec("ROLLBACK");
      }
      throw toSqliteLockedError(error);
    } finally {
      db?.close();
    }
  }

  runMigrations(): void {
    const db = this.openDb();
    try {
      migrate(db);
    } catch (error) {
      throw toSqliteLockedError(error);
    } finally {
      db.close();
    }
  }

  private openDb() {
    const { fileName, enableForeignKeyConstraints = true } = this.options;
    const db = new DatabaseSync(fileName, { enableForeignKeyConstraints });
    try {
      db.exec("PRAGMA journal_mode = WAL");
      db.exec("PRAGMA synchronous = FULL");
      return db;
    } catch (error) {
      db.close();
      throw toSqliteLockedError(error);
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

function toSqliteLockedError(error: unknown): unknown {
  if (!isSqliteLockedError(error)) {
    return error;
  }
  return new Error(
    "SQLite database is locked. Superego app and CLI share one SQLite database; avoid parallel Superego CLI commands and retry after the current Superego operation finishes.",
    { cause: error },
  );
}

function isSqliteLockedError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const message = "message" in error ? String(error.message) : "";
  const code = "code" in error ? String(error.code) : "";
  return (
    code === "SQLITE_BUSY" ||
    code === "SQLITE_LOCKED" ||
    message.includes("database is locked") ||
    message.includes("database table is locked")
  );
}

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

export default class SqliteDataRepositoriesManager
  implements DataRepositoriesManager
{
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
    const db = this.openDb();
    db.exec("BEGIN");
    const repos = new SqliteDataRepositories(
      db,
      this.options.defaultGlobalSettings,
      this.searchTextIndexStates,
      (callback) => transactionSucceededCallbacks.push(callback),
    );
    try {
      const { action, returnValue } = await fn(repos);
      db.exec(action === "commit" ? "COMMIT" : "ROLLBACK");
      SqliteDataRepositoriesManager.runTransactionSucceededCallbacks(
        transactionSucceededCallbacks,
      );
      return returnValue;
    } catch (error) {
      if (db.isTransaction) {
        db.exec("ROLLBACK");
      }
      throw error;
    } finally {
      db.close();
    }
  }

  runMigrations(): void {
    const db = this.openDb();
    migrate(db);
    db.close();
  }

  private openDb() {
    const { fileName, enableForeignKeyConstraints = true } = this.options;
    const db = new DatabaseSync(fileName, { enableForeignKeyConstraints });
    db.exec("PRAGMA journal_mode = WAL");
    db.exec("PRAGMA synchronous = FULL");
    return db;
  }

  private static runTransactionSucceededCallbacks(callbacks: (() => void)[]) {
    try {
      callbacks.forEach((callback) => callback());
    } catch {
      // Ignore errors.
    }
  }
}

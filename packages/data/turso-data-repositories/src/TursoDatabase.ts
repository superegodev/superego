import {
  connect,
  type Database as TursoWasmDatabase,
} from "@tursodatabase/database-wasm/bundle";

type TursoWasmStatement = Awaited<ReturnType<TursoWasmDatabase["prepare"]>>;

type ConnectionPool = {
  availableConnections: TursoWasmDatabase[];
  activeConnectionCount: number;
};

class TursoStatement {
  private statementPromise: Promise<TursoWasmStatement> | null = null;

  constructor(
    private database: TursoWasmDatabase,
    private sql: string,
    private ensureOpen: () => void,
  ) {}

  async run(...bindParameters: unknown[]): Promise<unknown> {
    return TursoDatabase.runExclusive(async () => {
      const statement = await this.getStatement();
      return statement.run(...bindParameters);
    });
  }

  async get(...bindParameters: unknown[]): Promise<unknown> {
    return TursoDatabase.runExclusive(async () => {
      const statement = await this.getStatement();
      return statement.get(...bindParameters);
    });
  }

  async all(...bindParameters: unknown[]): Promise<unknown[]> {
    return TursoDatabase.runExclusive(async () => {
      const statement = await this.getStatement();
      return statement.all(...bindParameters);
    });
  }

  private async getStatement(): Promise<TursoWasmStatement> {
    this.ensureOpen();
    this.statementPromise ??= Promise.resolve(
      this.database.prepare(this.sql) as unknown as TursoWasmStatement,
    );
    return this.statementPromise;
  }
}

/**
 * Small adapter around Turso's promise API. It keeps repository code close to
 * the synchronous node:sqlite implementation while making every execution
 * operation explicitly awaitable.
 */
export default class TursoDatabase {
  private static operationTail: Promise<void> = Promise.resolve();
  private static connectionPools = new Map<string, ConnectionPool>();
  private closed = false;

  private constructor(
    private database: TursoWasmDatabase,
    private fileName: string,
    private connectionPool: ConnectionPool,
  ) {}

  static async open(
    fileName: string,
    options: { timeout?: number } = {},
  ): Promise<TursoDatabase> {
    const connectionPool = TursoDatabase.connectionPools.get(fileName) ?? {
      availableConnections: [],
      activeConnectionCount: 0,
    };
    TursoDatabase.connectionPools.set(fileName, connectionPool);
    const database =
      connectionPool.availableConnections.pop() ??
      (await TursoDatabase.runExclusive(() => connect(fileName, options)));
    connectionPool.activeConnectionCount += 1;
    return new TursoDatabase(database, fileName, connectionPool);
  }

  prepare(sql: string): TursoStatement {
    this.ensureOpen();
    return new TursoStatement(this.database, sql, () => this.ensureOpen());
  }

  async exec(sql: string): Promise<void> {
    await TursoDatabase.runExclusive(async () => {
      this.ensureOpen();
      await this.database.exec(sql);
    });
  }

  /**
   * Creates a logical copy in OPFS. Turso's JavaScript backup and serialize
   * APIs are not implemented yet, so copying through SQL keeps export support
   * available without relying on native bindings.
   */
  async export(fileName: string): Promise<void> {
    if (fileName === this.fileName) {
      throw new Error("Cannot export a Turso database over itself.");
    }

    await TursoDatabase.removeDatabaseIfExists(fileName);

    const schemaEntries = (await this.prepare(`
      SELECT "type", "name", "sql"
      FROM "sqlite_schema"
      WHERE "sql" IS NOT NULL
        AND "name" NOT LIKE 'sqlite_%'
        AND "name" NOT LIKE '__turso_internal_%'
      ORDER BY CASE "type"
        WHEN 'table' THEN 0
        WHEN 'view' THEN 1
        WHEN 'index' THEN 2
        WHEN 'trigger' THEN 3
        ELSE 4
      END
    `).all()) as {
      type: "index" | "table" | "trigger" | "view";
      name: string;
      sql: string;
    }[];
    const destination = await TursoDatabase.open(fileName);
    try {
      await destination.exec("PRAGMA foreign_keys = OFF");
      await destination.exec("BEGIN IMMEDIATE");

      const tableEntries = schemaEntries.filter(({ type }) => type === "table");
      for (const { name, sql } of tableEntries) {
        await destination.exec(sql);
        await this.copyTableTo(destination, name);
      }
      for (const { sql, type } of schemaEntries) {
        if (type !== "table") {
          await destination.exec(sql);
        }
      }

      await destination.exec("COMMIT");
    } catch (error) {
      if (destination.isTransaction) {
        await destination.exec("ROLLBACK");
      }
      throw error;
    } finally {
      await destination.close();
    }
  }

  get isTransaction(): boolean {
    this.ensureOpen();
    return this.database.inTransaction;
  }

  async close(): Promise<void> {
    if (this.closed) {
      return;
    }
    this.closed = true;
    this.connectionPool.activeConnectionCount -= 1;
    this.connectionPool.availableConnections.push(this.database);
  }

  static async runExclusive<ReturnValue>(
    operation: () => Promise<ReturnValue>,
  ): Promise<ReturnValue> {
    const previousOperation = TursoDatabase.operationTail;
    let release: () => void = () => undefined;
    TursoDatabase.operationTail = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previousOperation;
    try {
      return await operation();
    } finally {
      release();
    }
  }

  private async copyTableTo(
    destination: TursoDatabase,
    tableName: string,
  ): Promise<void> {
    const escapedTableName = TursoDatabase.escapeIdentifier(tableName);
    const columns = (await this.prepare(
      `PRAGMA table_info(${escapedTableName})`,
    ).all()) as { name: string }[];
    if (columns.length === 0) {
      return;
    }

    const rows = (await this.prepare(
      `SELECT * FROM ${escapedTableName}`,
    ).all()) as Record<string, unknown>[];
    if (rows.length === 0) {
      return;
    }

    const escapedColumnNames = columns
      .map(({ name }) => TursoDatabase.escapeIdentifier(name))
      .join(", ");
    const placeholders = columns.map(() => "?").join(", ");
    const insert = destination.prepare(
      `INSERT INTO ${escapedTableName} (${escapedColumnNames}) VALUES (${placeholders})`,
    );
    for (const row of rows) {
      await insert.run(columns.map(({ name }) => row[name]));
    }
  }

  private static escapeIdentifier(identifier: string): string {
    return `"${identifier.replaceAll('"', '""')}"`;
  }

  private ensureOpen(): void {
    if (this.closed) {
      throw new TypeError("The database connection is not open");
    }
  }

  private static async removeOpfsFileIfExists(
    opfsRoot: FileSystemDirectoryHandle,
    fileName: string,
  ): Promise<void> {
    try {
      await opfsRoot.removeEntry(fileName);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "NotFoundError")) {
        throw error;
      }
    }
  }

  private static async removeDatabaseIfExists(fileName: string): Promise<void> {
    await TursoDatabase.runExclusive(async () => {
      const connectionPool = TursoDatabase.connectionPools.get(fileName);
      if (connectionPool?.activeConnectionCount) {
        throw new Error(
          "Cannot export over a database that is currently open.",
        );
      }
      TursoDatabase.connectionPools.delete(fileName);
      for (const database of connectionPool?.availableConnections ?? []) {
        await database.close();
      }

      const opfsRoot = await navigator.storage.getDirectory();
      await TursoDatabase.removeOpfsFileIfExists(opfsRoot, fileName);
      await TursoDatabase.removeOpfsFileIfExists(opfsRoot, `${fileName}-wal`);
    });
  }
}

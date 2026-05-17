import type { Database as TursoDatabase } from "@tursodatabase/database-wasm/bundle";

type TursoStatement = Awaited<ReturnType<TursoDatabase["prepare"]>>;

export default class AsyncSqliteDatabase {
  constructor(private db: TursoDatabase) {}

  get inTransaction() {
    return this.db.inTransaction;
  }

  prepare(query: string) {
    return new AsyncSqliteStatement(query, this.db);
  }

  exec(query: string): Promise<void> {
    return this.db.exec(query);
  }

  close(): Promise<void> {
    return this.db.close();
  }
}

class AsyncSqliteStatement {
  constructor(
    private query: string,
    private db: TursoDatabase,
  ) {}

  async run(...parameters: unknown[]) {
    const statement = await this.prepare();
    return statement.run(...parameters);
  }

  async get(...parameters: unknown[]) {
    const statement = await this.prepare();
    return statement.get(...parameters);
  }

  async all(...parameters: unknown[]) {
    const statement = await this.prepare();
    return statement.all(...parameters);
  }

  private prepare(): Promise<TursoStatement> {
    return this.db.prepare(this.query);
  }
}

export default function toSqliteLockedError(error: unknown): unknown {
  if (!isSqliteLockedError(error)) {
    return error;
  }
  return new Error(
    "SQLite database is locked. Avoid parallel Superego CLI commands.",
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

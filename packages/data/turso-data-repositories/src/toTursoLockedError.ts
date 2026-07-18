export default function toTursoLockedError(error: unknown): unknown {
  if (!isTursoLockedError(error)) {
    return error;
  }
  return new Error("Turso database is locked.", { cause: error });
}

function isTursoLockedError(error: unknown): boolean {
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

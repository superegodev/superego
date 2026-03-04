import type { Backend } from "@superego/backend";
import { dialog } from "electron";

export default async function exportDatabase(backend: Backend): Promise<void> {
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: "superego-backup.db",
    filters: [{ name: "SQLite Database", extensions: ["db"] }],
  });
  if (filePath) {
    await backend.database.export(filePath);
  }
}

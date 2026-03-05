import type { IntlShape } from "@formatjs/intl";
import type { Backend } from "@superego/backend";
import { dialog } from "electron";

export default async function exportDatabase(
  backend: Backend,
  intl: IntlShape,
): Promise<void> {
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: "superego-backup.db",
    filters: [{ name: "SQLite Database", extensions: ["db"] }],
  });
  if (filePath) {
    const result = await backend.database.export(filePath);
    if (result.success) {
      await dialog.showMessageBox({
        type: "info",
        title: intl.formatMessage({ defaultMessage: "Export completed" }),
        message: intl.formatMessage({
          defaultMessage: "Database exported successfully.",
        }),
      });
    } else {
      dialog.showErrorBox(
        intl.formatMessage({ defaultMessage: "Export failed" }),
        JSON.stringify(result.error, null, 2),
      );
    }
  }
}

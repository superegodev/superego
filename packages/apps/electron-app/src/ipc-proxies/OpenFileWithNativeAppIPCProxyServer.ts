import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Backend, FileId, UnexpectedError } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import type { FileRef } from "@superego/schema";
import {
  extractErrorDetails,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import { app, ipcMain, shell } from "electron";
import filenamify from "filenamify";

export default class OpenFileWithNativeAppIPCProxyServer {
  private backend: Backend;
  private tempDir: string;

  constructor(backend: Backend) {
    this.backend = backend;
    this.tempDir = join(app.getPath("temp"), "superego-files");
  }

  start() {
    ipcMain.handle(
      "openFileWithNativeApp",
      async (_event, file: FileRef): ResultPromise<null, UnexpectedError> => {
        try {
          const filePath = await this.createTempFile(file);
          const errorMessage = await shell.openPath(filePath);
          return errorMessage === ""
            ? makeSuccessfulResult(null)
            : makeUnsuccessfulResult({
                name: "UnexpectedError",
                details: { path: filePath, cause: { message: errorMessage } },
              });
        } catch (error) {
          return makeUnsuccessfulResult({
            name: "UnexpectedError",
            details: { cause: extractErrorDetails(error) },
          });
        }
      },
    );
  }

  private async createTempFile(file: FileRef): Promise<string> {
    const dir = join(this.tempDir, file.id);
    mkdirSync(dir, { recursive: true });

    const filePath = join(dir, filenamify(file.name, { replacement: "_" }));

    if (existsSync(filePath)) {
      return filePath;
    }

    const { success, data, error } = await this.backend.files.getContent(
      file.id as FileId,
    );
    if (!success) {
      throw error;
    }

    writeFileSync(filePath, data, {
      // Read-only
      mode: 0o444,
    });
    return filePath;
  }
}

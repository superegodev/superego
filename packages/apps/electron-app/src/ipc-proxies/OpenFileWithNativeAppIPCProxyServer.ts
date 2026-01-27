import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Backend, FileId, UnexpectedError } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import type { FileRef, ProtoFile } from "@superego/schema";
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
      async (
        _event,
        file: ProtoFile | FileRef,
      ): ResultPromise<null, UnexpectedError> => {
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

  private async createTempFile(file: ProtoFile | FileRef): Promise<string> {
    let content: Uint8Array<ArrayBuffer>;
    if ("content" in file) {
      content = file.content;
    } else {
      const { success, data, error } = await this.backend.files.getContent(
        file.id as FileId,
      );
      if (!success) {
        throw error;
      }
      content = data;
    }

    const sha256 = createHash("sha256").update(content).digest("hex");
    const dir = join(this.tempDir, sha256);
    mkdirSync(dir, { recursive: true });

    const filePath = join(dir, filenamify(file.name, { replacement: "_" }));

    if (existsSync(filePath)) {
      return filePath;
    }

    writeFileSync(filePath, content, {
      // Read-only
      mode: 0o444,
    });
    return filePath;
  }
}

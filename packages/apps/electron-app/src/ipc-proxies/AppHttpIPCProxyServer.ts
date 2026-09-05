import { randomUUID } from "node:crypto";
import type { AppId, AppVersionId, Backend } from "@superego/backend";
import {
  appHttpFailure,
  appHttpRequestSchema,
  makeSuccessfulResult,
} from "@superego/shared-utils";
import { BrowserWindow, ipcMain, type WebContents } from "electron";
import * as v from "valibot";
import { DestinationDenied } from "../main/app-http/destinationPolicy.js";
import executeHttpRequest from "../main/app-http/executeHttpRequest.js";

interface Instance {
  sender: WebContents;
  appId: AppId;
  versionId: AppVersionId;
  allowedOrigins: string[];
  controller: AbortController;
}
export default class AppHttpIPCProxyServer {
  private instances = new Map<string, Instance>();
  private versions = "";
  constructor(private backend: Backend) {}
  start() {
    ipcMain.handle(
      "appHttp.open",
      async (event, appId: AppId, versionId: AppVersionId) => {
        if (
          event.senderFrame !== event.sender.mainFrame ||
          !BrowserWindow.fromWebContents(event.sender)
        ) {
          return appHttpFailure("InvalidArguments");
        }
        const result = await this.backend.apps.list();
        const app = result.data?.find(
          (candidate) =>
            candidate.id === appId && candidate.latestVersion.id === versionId,
        );
        if (!app) {
          return appHttpFailure("ObsoleteInstance");
        }
        const id = randomUUID();
        this.instances.set(id, {
          sender: event.sender,
          appId,
          versionId,
          allowedOrigins:
            app.latestVersion.permissions?.http?.allowedOrigins ?? [],
          controller: new AbortController(),
        });
        return makeSuccessfulResult(id);
      },
    );
    ipcMain.handle("appHttp.close", (event, id: unknown) => {
      if (
        typeof id !== "string" ||
        event.senderFrame !== event.sender.mainFrame
      ) {
        return;
      }
      const instance = this.instances.get(id);
      if (instance?.sender === event.sender) {
        this.close(id);
      }
    });
    ipcMain.handle(
      "appHttp.request",
      async (event, id: unknown, input: unknown) => {
        const instance =
          typeof id === "string" ? this.instances.get(id) : undefined;
        if (
          !instance ||
          instance.sender !== event.sender ||
          event.senderFrame !== event.sender.mainFrame
        ) {
          return appHttpFailure("ObsoleteInstance");
        }
        const parsed = v.safeParse(appHttpRequestSchema(), input);
        if (!parsed.success) {
          return appHttpFailure("InvalidArguments");
        }
        const assertCurrent = async () => {
          const result = await this.backend.apps.list();
          if (
            !result.data?.some(
              (app) =>
                app.id === instance.appId &&
                app.latestVersion.id === instance.versionId,
            )
          ) {
            instance.controller.abort();
          }
          instance.controller.signal.throwIfAborted();
        };
        try {
          const signal = AbortSignal.any([
            instance.controller.signal,
            AbortSignal.timeout(30_000),
          ]);
          return makeSuccessfulResult(
            await executeHttpRequest(
              parsed.output,
              instance.allowedOrigins,
              signal,
              assertCurrent,
            ),
          );
        } catch (error) {
          return appHttpFailure(
            instance.controller.signal.aborted
              ? "ObsoleteInstance"
              : error instanceof DestinationDenied
                ? "DestinationDenied"
                : "TransportFailure",
          );
        }
      },
    );
    // Also detects CLI/database changes, which do not pass through renderer IPC.
    setInterval(() => {
      this.refresh().catch(() => {});
    }, 1_000).unref();
  }
  async refresh() {
    const result = await this.backend.apps.list();
    if (!result.success) {
      return;
    }
    for (const [id, instance] of this.instances) {
      if (
        instance.sender.isDestroyed() ||
        !result.data.some(
          (app) =>
            app.id === instance.appId &&
            app.latestVersion.id === instance.versionId,
        )
      ) {
        this.close(id);
      }
    }
    const versions = JSON.stringify(
      result.data.map((app) => [app.id, app.latestVersion.id]),
    );
    if (this.versions !== versions) {
      this.versions = versions;
      this.notify();
    }
  }
  notify() {
    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send("apps.changed");
    }
  }
  private close(id: string) {
    this.instances.get(id)?.controller.abort();
    this.instances.delete(id);
  }
}

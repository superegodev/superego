import {
  appHttpFailure,
  appHttpRequestSchema,
  makeSuccessfulResult,
} from "@superego/shared-utils";
import { BrowserWindow, ipcMain } from "electron";
import * as v from "valibot";
import { DestinationDenied } from "../main/app-http/destinationPolicy.js";
import executeHttpRequest from "../main/app-http/executeHttpRequest.js";

export default class AppHttpIPCProxyServer {
  start() {
    ipcMain.handle(
      "appHttp.request",
      async (event, input: unknown, allowedOrigins: unknown) => {
        // Only the trusted renderer supplies permissions. The iframe sends request data.
        if (
          event.senderFrame !== event.sender.mainFrame ||
          !BrowserWindow.fromWebContents(event.sender)
        ) {
          return appHttpFailure("InvalidArguments");
        }
        const parsed = v.safeParse(appHttpRequestSchema(), input);
        const origins = v.safeParse(v.array(v.string()), allowedOrigins);
        if (!parsed.success || !origins.success) {
          return appHttpFailure("InvalidArguments");
        }
        try {
          return makeSuccessfulResult(
            await executeHttpRequest(
              parsed.output,
              origins.output,
              AbortSignal.timeout(30_000),
            ),
          );
        } catch (error) {
          return appHttpFailure(
            error instanceof DestinationDenied
              ? "DestinationDenied"
              : "TransportFailure",
          );
        }
      },
    );
  }
}

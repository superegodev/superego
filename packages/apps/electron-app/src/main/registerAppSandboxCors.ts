import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Session, WebFrameMain } from "electron";
import {
  type CorsRequest,
  getCorsRequest,
  isAppSandboxRequest,
  makeCorsResponse,
} from "./appSandboxCors.js";

export default function registerAppSandboxCors(session: Session): void {
  const hostUrl = pathToFileURL(
    join(import.meta.dirname, "../renderer/index.html"),
  ).href;
  const filter = { urls: ["http://*/*", "https://*/*"] };
  const requests = new Map<
    number,
    { frame: WebFrameMain; cors: CorsRequest }
  >();

  // Chromium checks the document's connect-src before issuing either fetch or
  // its preflight. Only requests to CSP-permitted destinations reach this code;
  // do not try to recover permissions from the app's mutable DOM or Origin.
  // Electron supplies the requesting frame for OPTIONS as well as fetch.
  session.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    requests.delete(details.id);
    if (isAppSandboxRequest(details, hostUrl) && details.frame) {
      const cors = getCorsRequest(details);
      if (cors) {
        requests.set(details.id, { frame: details.frame, cors });
      }
    }
    callback({});
  });
  session.webRequest.onHeadersReceived(filter, (details, callback) => {
    const request = requests.get(details.id);
    requests.delete(details.id);
    if (
      request &&
      request.frame === details.frame &&
      isAppSandboxRequest(details, hostUrl)
    ) {
      callback(makeCorsResponse(request.cors, details.responseHeaders));
    } else {
      callback({});
    }
  });
  session.webRequest.onCompleted(filter, ({ id }) => requests.delete(id));
  session.webRequest.onErrorOccurred(filter, ({ id }) => requests.delete(id));
}

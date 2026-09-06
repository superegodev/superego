import { normalizeHttpOrigin } from "@superego/shared-utils";

const configuredDocuments = new WeakSet<Document>();

export default function installConnectSrcPolicy(
  document: Document,
  allowedOrigins: string[],
): void {
  if (configuredDocuments.has(document)) {
    return;
  }
  const origins = [...new Set(allowedOrigins.map(normalizeHttpOrigin))];
  const policy = document.createElement("meta");
  policy.httpEquiv = "Content-Security-Policy";
  // Preserve sandbox modules, local file blobs, and the built-in map tiles.
  policy.content = [
    "connect-src 'self' data: blob: https://tiles.openfreemap.org",
    ...origins,
  ].join(" ");
  document.head.append(policy);
  // Chromium retains the processed policy even if app code removes the meta.
  // A permission change requires a new iframe document, not another policy.
  configuredDocuments.add(document);
}

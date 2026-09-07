export default function normalizeHttpOrigin(value: string): string {
  const url = new URL(value);
  if (
    !/^https?:$/.test(url.protocol) ||
    url.username ||
    url.password ||
    // Chromium percent-encodes wildcard hostnames; Node leaves them decoded.
    decodeURIComponent(url.hostname).includes("*") ||
    // Only CSP host-source characters may enter the generated connect-src list.
    !/^https?:\/\/(?:[a-z0-9.-]+|\[[0-9a-f:]+\])(?::[0-9]+)?$/i.test(
      url.origin,
    ) ||
    /\s/.test(value) ||
    !/^https?:\/\/[^/?#]+\/?$/i.test(value) ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    value.includes("?") ||
    value.includes("#") ||
    value.includes("\\") ||
    value.trim() !== value
  ) {
    throw new Error(
      "Expected an HTTP(S) origin without credentials, path, query or fragment.",
    );
  }
  return url.origin;
}

import type {
  AppHttpError,
  AppHttpRequest,
  AppPermissions,
  AppStateError,
} from "@superego/backend";
import {
  DataType,
  type AnyTypeDefinition,
  valibotSchemas as schemaSchemas,
} from "@superego/schema";
import * as v from "valibot";
import makeUnsuccessfulResult from "./makeUnsuccessfulResult.js";

export function normalizeHttpOrigin(value: string): string {
  const url = new URL(value);
  if (
    !/^https?:$/.test(url.protocol) ||
    url.username ||
    url.password ||
    url.hostname.includes("*") ||
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
export function appPermissionsSchema(): v.GenericSchema<
  AppPermissions,
  AppPermissions
> {
  return v.strictObject({
    modals: v.optional(v.boolean()),
    downloads: v.optional(v.boolean()),
    http: v.optional(
      v.strictObject({
        allowedOrigins: v.array(
          v.pipe(
            v.string(),
            v.check((origin) => {
              try {
                normalizeHttpOrigin(origin);
                return true;
              } catch {
                return false;
              }
            }, "Expected an HTTP(S) origin."),
            v.transform(normalizeHttpOrigin),
          ),
        ),
      }),
    ),
  });
}
function supportedStateType(definition: AnyTypeDefinition): boolean {
  switch (definition.dataType) {
    case DataType.File:
    case DataType.DocumentRef:
      return false;
    case DataType.Struct:
      return Object.values(definition.properties).every(supportedStateType);
    case DataType.List:
      return supportedStateType(definition.items);
    default:
      return true;
  }
}
export function appStateSchema() {
  return v.pipe(
    schemaSchemas.schema(),
    v.check(
      (schema) => Object.values(schema.types).every(supportedStateType),
      "App state cannot contain File or DocumentRef types.",
    ),
  );
}
/** Reject values that cannot round-trip through the existing JSON migration sandbox. */
export function isJsonValue(
  value: unknown,
  ancestors = new Set<object>(),
): boolean {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  if (typeof value !== "object" || ancestors.has(value)) {
    return false;
  }
  if (
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) !== Object.prototype &&
    Object.getPrototypeOf(value) !== null
  ) {
    return false;
  }
  ancestors.add(value);
  const valid = Object.values(value).every((child) =>
    isJsonValue(child, ancestors),
  );
  ancestors.delete(value);
  return valid;
}
export function appStateFailure(reason: AppStateError["details"]["reason"]) {
  return makeUnsuccessfulResult<AppStateError>({
    name: "AppStateError",
    details: { reason },
  });
}
export function appHttpFailure(reason: AppHttpError["details"]["reason"]) {
  return makeUnsuccessfulResult<AppHttpError>({
    name: "AppHttpError",
    details: { reason },
  });
}
const token = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
const controlledHeaders =
  /^(host|connection|content-length|transfer-encoding|upgrade|expect|trailer|te|proxy-.*|sec-.*|forwarded|x-forwarded-.*)$/i;
export function appHttpRequestSchema(): v.GenericSchema<
  unknown,
  AppHttpRequest
> {
  return v.pipe(
    v.strictObject({
      url: v.pipe(
        v.string(),
        v.check((value) => {
          try {
            const url = new URL(value);
            return (
              /^https?:$/.test(url.protocol) && !url.username && !url.password
            );
          } catch {
            return false;
          }
        }),
      ),
      method: v.optional(
        v.pipe(
          v.string(),
          v.regex(token),
          v.transform((method) => method.toUpperCase()),
          v.check((method) => !["CONNECT", "TRACE", "TRACK"].includes(method)),
        ),
      ),
      headers: v.optional(
        v.array(
          v.tuple([
            v.pipe(
              v.string(),
              v.regex(token),
              v.check((name) => !controlledHeaders.test(name)),
            ),
            v.pipe(
              v.string(),
              v.check((value) => !/[^\t\x20-\x7e\x80-\xff]/.test(value)),
            ),
          ]),
        ),
      ),
      body: v.optional(
        v.strictObject({
          encoding: v.picklist(["utf8", "base64"]),
          data: v.string(),
        }),
      ),
    }),
    v.check(
      (request) =>
        !request.body || !["GET", "HEAD"].includes(request.method ?? "GET"),
    ),
    v.check(
      (request) =>
        request.body?.encoding !== "base64" ||
        /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/][AQgw]==|[A-Za-z0-9+/]{2}[AEIMQUYcgkosw048]=)?$/.test(
          request.body.data,
        ),
    ),
  );
}

import type { AppPermissions, AppStateError } from "@superego/backend";
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
export function httpOriginSchema() {
  return v.pipe(
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
  );
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
        allowedOrigins: v.array(httpOriginSchema()),
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

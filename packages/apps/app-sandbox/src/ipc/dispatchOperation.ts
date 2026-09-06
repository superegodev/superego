import type { Backend, AppHttpRequest } from "@superego/backend";
import type { Result, ResultPromise } from "@superego/global-types";
import { makeUnsuccessfulResult } from "@superego/shared-utils";

export interface HostBackend {
  documents: {
    create: Backend["documents"]["create"];
    createNewVersion: (...args: any[]) => ResultPromise<any, any>;
    delete: (...args: any[]) => Result<null, never>;
  };
  files: { getContent: Backend["files"]["getContent"] };
  state?:
    | {
        get: () => ReturnType<Backend["apps"]["getState"]>;
        update: (
          expectedRevision: number,
          content: Record<string, unknown>,
        ) => ReturnType<Backend["apps"]["updateState"]>;
      }
    | undefined;
  http?:
    | {
        request: (
          request: AppHttpRequest,
        ) => ReturnType<Backend["apps"]["requestHttp"]>;
      }
    | undefined;
}
export const invalidBridgeArguments = () =>
  makeUnsuccessfulResult({
    name: "AppBridgeError",
    details: { reason: "InvalidArguments" },
  });
/** Explicit dispatch: neither prototype properties nor app editing APIs are callable. */
export default async function dispatchOperation(
  backend: HostBackend,
  entity: string,
  method: string,
  args: unknown[],
): ResultPromise<any, any> {
  if (
    typeof entity !== "string" ||
    typeof method !== "string" ||
    !Array.isArray(args) ||
    !isBridgeValue(args)
  ) {
    return invalidBridgeArguments();
  }
  const stringAt = (index: number) => typeof args[index] === "string";
  const objectAt = (index: number) =>
    args[index] !== null &&
    typeof args[index] === "object" &&
    !Array.isArray(args[index]);
  switch (`${entity}.${method}`) {
    case "documents.create":
      if (args.length === 1 && objectAt(0)) {
        return backend.documents.create(
          args[0] as Parameters<Backend["documents"]["create"]>[0],
        );
      }
      break;
    case "documents.createNewVersion":
      if (
        args.length === 4 &&
        stringAt(0) &&
        stringAt(1) &&
        stringAt(2) &&
        objectAt(3)
      ) {
        return backend.documents.createNewVersion(...args);
      }
      break;
    case "documents.delete":
      if (args.length === 2 && stringAt(0) && stringAt(1)) {
        return backend.documents.delete(...args);
      }
      break;
    case "files.getContent":
      if (args.length === 1 && stringAt(0)) {
        return backend.files.getContent(
          args[0] as Parameters<Backend["files"]["getContent"]>[0],
        );
      }
      break;
    case "state.get":
      if (args.length === 0 && backend.state) {
        return backend.state.get();
      }
      break;
    case "state.update":
      if (
        args.length === 2 &&
        Number.isSafeInteger(args[0]) &&
        (args[0] as number) > 0 &&
        objectAt(1) &&
        backend.state
      ) {
        return backend.state.update(
          args[0] as number,
          args[1] as Record<string, unknown>,
        );
      }
      break;
    case "http.request":
      if (args.length === 1 && objectAt(0) && backend.http) {
        return backend.http.request(args[0] as AppHttpRequest);
      }
      break;
  }
  return invalidBridgeArguments();
}

function isBridgeValue(value: unknown, ancestors = new Set<object>()): boolean {
  if (
    value === undefined ||
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  if (value instanceof Uint8Array) {
    return true;
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
    isBridgeValue(child, ancestors),
  );
  ancestors.delete(value);
  return valid;
}

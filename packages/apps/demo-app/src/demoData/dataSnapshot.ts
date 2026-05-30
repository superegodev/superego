import type { Data } from "@superego/demo-data-repositories";

const dateKeys = new Set([
  "createdAt",
  "enqueuedAt",
  "finishedProcessingAt",
  "processingStartedAt",
  "startedProcessingAt",
]);

export function serializeDataSnapshot(data: Data): string {
  return JSON.stringify(data, (_key, value) => {
    if (value instanceof Uint8Array) {
      return {
        __type: "Uint8Array",
        data: [...value],
      };
    }
    return value;
  });
}

export function deserializeDataSnapshot(value: unknown): Data {
  return JSON.parse(JSON.stringify(value), (key, value) => {
    if (dateKeys.has(key) && typeof value === "string") {
      return new Date(value);
    }
    if (
      typeof value === "object" &&
      value !== null &&
      "__type" in value &&
      value.__type === "Uint8Array" &&
      "data" in value &&
      Array.isArray(value.data)
    ) {
      return new Uint8Array(value.data);
    }
    return value;
  }) as Data;
}

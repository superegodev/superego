export function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, jsonReplacer, 2)}\n`);
}

function jsonReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Uint8Array) {
    return {
      type: "Uint8Array",
      base64: Buffer.from(value).toString("base64"),
    };
  }
  return value;
}

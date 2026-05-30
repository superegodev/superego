export async function printJson(value: unknown): Promise<void> {
  await writeStdout(`${JSON.stringify(value, jsonReplacer, 2)}\n`);
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

function writeStdout(value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    process.stdout.write(value, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

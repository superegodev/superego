import { existsSync, readdirSync, statSync } from "node:fs";

export default function assertEmptyTarget(path: string): void {
  if (!existsSync(path)) {
    return;
  }
  if (!statSync(path).isDirectory()) {
    throw new Error(`${path} exists and is not a directory.`);
  }
  if (readdirSync(path).length > 0) {
    throw new Error(`${path} already exists and is not empty.`);
  }
}

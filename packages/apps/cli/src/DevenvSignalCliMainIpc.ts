import { createInterface } from "node:readline";
import type { Writable } from "node:stream";
import type { Pack } from "@superego/backend";

export enum DevenvSignalType {
  PreviewPack = "PreviewPack",
}

export interface PreviewPackDevenvSignal {
  type: DevenvSignalType.PreviewPack;
  pack: Pack;
}

export type DevenvSignal = PreviewPackDevenvSignal;

export function sendPreviewPack(stdin: Writable, pack: Pack): void {
  const previewPack: PreviewPackDevenvSignal = {
    type: DevenvSignalType.PreviewPack,
    pack: pack,
  };
  stdin.write(`${JSON.stringify(previewPack)}\n`);
}

export async function* readDevenvSignals(): AsyncGenerator<DevenvSignal> {
  const lines = createInterface({ input: process.stdin });

  for await (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;

    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      console.error(
        `[devenv] Failed to parse signal JSON: ${trimmed.slice(0, 200)}`,
      );
      continue;
    }

    if (typeof parsed !== "object" || parsed === null || !("type" in parsed)) {
      console.error(
        "[devenv] Signal JSON must be an object with a 'type' field.",
      );
      continue;
    }

    const signal = parsed as Record<string, unknown>;
    if (signal["type"] === DevenvSignalType.PreviewPack) {
      if (
        !("pack" in signal) ||
        typeof signal["pack"] !== "object" ||
        signal["pack"] === null
      ) {
        console.error(
          "[devenv] Signal of type 'PreviewPack' must include a 'pack' object.",
        );
        continue;
      }
      yield {
        type: DevenvSignalType.PreviewPack,
        pack: signal["pack"] as Pack,
      };
    } else {
      console.error(`[devenv] Unknown signal type: ${String(signal["type"])}`);
    }
  }
}

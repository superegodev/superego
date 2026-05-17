import { Worker as NodeWorker, type WorkerOptions } from "node:worker_threads";

type BrowserWorkerEvent = { data: unknown };

type BrowserWorkerListener =
  | ((event: BrowserWorkerEvent) => void)
  | { handleEvent: (event: BrowserWorkerEvent) => void };

const tursoWorkerPreamble = `
import { parentPort } from "node:worker_threads";
import {
  closeSync,
  fstatSync,
  ftruncateSync,
  fsyncSync,
  openSync,
  readSync,
  writeSync,
} from "node:fs";

class NodeSyncAccessHandle {
  constructor(path, create) {
    try {
      this.fileDescriptor = openSync(path, "r+");
    } catch (error) {
      if (!create) {
        throw error;
      }
      this.fileDescriptor = openSync(path, "w+");
    }
  }

  read(buffer, options = {}) {
    return readSync(
      this.fileDescriptor,
      buffer,
      0,
      buffer.byteLength,
      Number(options.at ?? 0),
    );
  }

  write(buffer, options = {}) {
    return writeSync(
      this.fileDescriptor,
      buffer,
      0,
      buffer.byteLength,
      Number(options.at ?? 0),
    );
  }

  flush() {
    fsyncSync(this.fileDescriptor);
  }

  truncate(size) {
    ftruncateSync(this.fileDescriptor, Number(size));
  }

  getSize() {
    return fstatSync(this.fileDescriptor).size;
  }

  close() {
    closeSync(this.fileDescriptor);
  }
}

Object.defineProperty(globalThis, "self", {
  configurable: true,
  value: globalThis,
});
Object.defineProperty(globalThis, "postMessage", {
  configurable: true,
  value: (message) => parentPort.postMessage(message),
});
Object.defineProperty(globalThis, "navigator", {
  configurable: true,
  value: {
    storage: {
      async getDirectory() {
        return {
          async getFileHandle(path, options = {}) {
            return {
              async createSyncAccessHandle() {
                return new NodeSyncAccessHandle(path, options.create ?? false);
              },
            };
          },
        };
      },
    },
  },
});

parentPort.on("message", (data) => {
  if (data.__turso__ === "unregister") {
    parentPort.postMessage({ __turso__: true, id: data.id });
    return;
  }
  globalThis.onmessage?.({ data });
});
`;

class BrowserLikeWorker extends NodeWorker {
  private browserListenerWrappers = new Map<
    BrowserWorkerListener,
    (data: unknown) => void
  >();

  constructor(specifier: string | URL, options?: WorkerOptions) {
    let normalizedSpecifier = specifier;
    if (
      typeof normalizedSpecifier === "string" &&
      normalizedSpecifier.startsWith("data:text/javascript")
    ) {
      const commaIndex = normalizedSpecifier.indexOf(",");
      const workerSource = decodeURIComponent(
        normalizedSpecifier.slice(commaIndex + 1),
      );
      normalizedSpecifier = new URL(
        `data:text/javascript;charset=utf-8,${encodeURIComponent(
          tursoWorkerPreamble + workerSource,
        )}`,
      );
    }
    super(normalizedSpecifier, options);
    this.setMaxListeners(0);
  }

  addEventListener(type: string, listener: BrowserWorkerListener): void {
    if (type !== "message") {
      return;
    }

    const wrappedListener = (data: unknown) => {
      const event = { data };
      if (typeof listener === "function") {
        listener(event);
      } else {
        listener.handleEvent(event);
      }
    };
    this.browserListenerWrappers.set(listener, wrappedListener);
    this.on("message", wrappedListener);
  }

  removeEventListener(type: string, listener: BrowserWorkerListener): void {
    if (type !== "message") {
      return;
    }

    const wrappedListener = this.browserListenerWrappers.get(listener);
    if (wrappedListener == null) {
      return;
    }
    this.off("message", wrappedListener);
    this.browserListenerWrappers.delete(listener);
  }
}

(globalThis as Record<string, unknown>)["Worker"] = BrowserLikeWorker;

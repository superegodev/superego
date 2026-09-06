import type { GlobalSettings } from "@superego/backend";
import type {
  DataRepositories,
  DataRepositoriesManager,
} from "@superego/executing-backend";
import type Data from "./Data.js";
import DemoDataRepositories from "./DemoDataRepositories.js";
import DemoConversationTextSearchIndex from "./repositories/DemoConversationTextSearchIndex.js";
import DemoDocumentTextSearchIndex from "./repositories/DemoDocumentTextSearchIndex.js";
import clone from "./utils/clone.js";
import migrateAppState from "./utils/migrateAppState.js";

const OVERWRITE = "OVERWRITE";

export default class DemoDataRepositoriesManager implements DataRepositoriesManager {
  private databaseVersion = 2;
  private objectStoreName = "data";
  private objectStoreDataKeyPath = "id";
  private objectStoreDataKeyValue = "data";
  private data: Data | null = null;
  private lock: string | null = null;
  private searchTextIndexStates = {
    conversation: DemoConversationTextSearchIndex.getSearchTextIndexState(),
    document: DemoDocumentTextSearchIndex.getSearchTextIndexState(),
  };

  constructor(
    private defaultGlobalSettings: GlobalSettings,
    private databaseName = "superego",
    private inMemory = false,
  ) {}

  async runInSerializableTransaction<ReturnValue>(
    fn: (
      repos: DataRepositories,
    ) => Promise<{ action: "commit" | "rollback"; returnValue: ReturnValue }>,
    options: { retryOnConflict?: boolean } = {},
  ): Promise<ReturnValue> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await this.executeTransaction(fn);
      } catch (error) {
        const conflict =
          error instanceof Error &&
          ["Transaction aborted", "IndexedDb transaction aborted"].includes(
            error.message,
          );
        if (!options.retryOnConflict || !conflict || attempt >= 8) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 10 * (attempt + 1)));
      }
    }
  }

  private async executeTransaction<ReturnValue>(
    fn: (
      repos: DataRepositories,
    ) => Promise<{ action: "commit" | "rollback"; returnValue: ReturnValue }>,
  ): Promise<ReturnValue> {
    const transactionId = crypto.randomUUID();
    let shouldAbort = false;
    const transactionSucceededCallbacks: (() => void)[] = [];
    const transactionData = (await this.readData()) ?? {
      version: crypto.randomUUID(),
      apps: {},
      appVersions: {},
      backgroundJobs: {},
      collectionCategories: {},
      collections: {},
      collectionVersions: {},
      conversations: {},
      documents: {},
      documentVersions: {},
      files: {},
      documentTextSearchTexts: {},
      conversationTextSearchTexts: {},
      globalSettings: { value: this.defaultGlobalSettings },
    };
    const initialVersion = transactionData.version;
    const onWrite = () => {
      transactionData.version = crypto.randomUUID();
      if (this.lock === null) {
        this.lock = transactionId;
      } else if (this.lock !== transactionId) {
        shouldAbort = true;
      }
    };
    const savepoints: { [name: string]: Data } = {};
    const createSavepoint = async () => {
      const name = crypto.randomUUID();
      savepoints[name] = clone(transactionData);
      return name;
    };
    const rollbackToSavepoint = async (name: string) => {
      transactionData.version = savepoints[name]!.version;
      (
        [
          "apps",
          "appVersions",
          "backgroundJobs",
          "collectionCategories",
          "collections",
          "collectionVersions",
          "conversations",
          "documents",
          "documentVersions",
          "files",
          "documentTextSearchTexts",
          "conversationTextSearchTexts",
          "globalSettings",
        ] as const
      ).forEach((property) => {
        for (const key of Object.keys(transactionData[property])) {
          delete (transactionData[property] as Record<string, unknown>)[key];
        }
        Object.assign(transactionData[property], savepoints[name]![property]);
      });
      delete savepoints[name];
    };
    const repos = new DemoDataRepositories(
      transactionData,
      onWrite,
      (callback: () => void) => {
        transactionSucceededCallbacks.push(callback);
      },
      this.searchTextIndexStates,
      createSavepoint,
      rollbackToSavepoint,
    );
    try {
      const { action, returnValue } = await fn(repos);
      repos.dispose();
      if (shouldAbort) {
        throw new Error("Transaction aborted");
      }
      if (action === "commit" && transactionData.version !== initialVersion) {
        this.lock = null;
        await this.writeData(clone(transactionData), initialVersion);
        DemoDataRepositoriesManager.runTransactionSucceededCallbacks(
          transactionSucceededCallbacks,
        );
      }
      return returnValue;
    } finally {
      repos.dispose();
      if (this.lock === transactionId) {
        this.lock = null;
      }
    }
  }

  private upgradeDatabase(event: IDBVersionChangeEvent) {
    const request = event.target as IDBOpenDBRequest;
    const database = request.result;
    if (!database.objectStoreNames.contains(this.objectStoreName)) {
      database.createObjectStore(this.objectStoreName, {
        keyPath: this.objectStoreDataKeyPath,
      });
      return;
    }
    if (event.oldVersion < 2) {
      const store = request.transaction!.objectStore(this.objectStoreName);
      const read: IDBRequest<{ id: string; data: Data } | undefined> =
        store.get(this.objectStoreDataKeyValue);
      read.onsuccess = () => {
        if (read.result) {
          migrateAppState(read.result.data);
          store.put(read.result);
        }
      };
    }
  }

  private async writeData(data: Data, initialVersion: string): Promise<void> {
    if (this.inMemory) {
      if (
        this.data === null ||
        initialVersion === OVERWRITE ||
        this.data.version === initialVersion
      ) {
        this.data = data;
        return;
      }
      throw new Error("Transaction aborted");
    }

    return new Promise((resolve, reject) => {
      const openReq = indexedDB.open(this.databaseName, this.databaseVersion);
      openReq.onupgradeneeded = (event) => this.upgradeDatabase(event);
      openReq.onerror = (evt) => {
        this.logError(
          `Failed opening IndexedDb database ${this.databaseName} version ${this.databaseVersion}`,
          (evt.target as IDBOpenDBRequest).error,
        );
        reject(
          new Error(
            `Failed opening IndexedDb database ${this.databaseName} version ${this.databaseVersion}`,
            { cause: (evt.target as IDBOpenDBRequest).error },
          ),
        );
      };
      openReq.onsuccess = (evt) => {
        const db = (evt.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([this.objectStoreName], "readwrite");
        const store = transaction.objectStore(this.objectStoreName);
        const getRequest: IDBRequest<{ data: Data } | undefined> = store.get(
          this.objectStoreDataKeyValue,
        );
        getRequest.onsuccess = () => {
          if (
            getRequest.result === undefined ||
            initialVersion === OVERWRITE ||
            getRequest.result.data.version === initialVersion
          ) {
            const putReq = store.put({
              [this.objectStoreDataKeyPath]: this.objectStoreDataKeyValue,
              data: data,
            });
            putReq.onsuccess = () => {
              transaction.commit();
            };
            putReq.onerror = (evt) => {
              this.logError(
                `Failed saving object to IndexedDb object store ${this.objectStoreName}`,
                (evt.target as IDBRequest).error,
              );
              transaction.abort();
            };
          } else {
            transaction.abort();
          }
        };
        getRequest.onerror = (evt) => {
          this.logError(
            `Failed reading object from IndexedDb object store ${this.objectStoreName}`,
            (evt.target as IDBRequest).error,
          );
          transaction.abort();
        };
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        transaction.onerror = () => {
          this.logError("IndexedDb transaction failed", transaction.error);
          db.close();
          reject(
            new Error("IndexedDb transaction failed", {
              cause: transaction.error,
            }),
          );
        };
        transaction.onabort = () => {
          this.logError("IndexedDb transaction aborted", transaction.error);
          db.close();
          reject(
            new Error("IndexedDb transaction aborted", {
              cause: transaction.error,
            }),
          );
        };
      };
    });
  }

  private async readData(): Promise<Data | null> {
    if (this.inMemory) {
      return this.data ? clone(this.data) : null;
    }

    return new Promise((resolve, reject) => {
      const openReq = indexedDB.open(this.databaseName, this.databaseVersion);
      openReq.onupgradeneeded = (event) => this.upgradeDatabase(event);
      openReq.onerror = (evt) => {
        this.logError(
          `Failed opening IndexedDb database ${this.databaseName} version ${this.databaseVersion}`,
          (evt.target as IDBOpenDBRequest).error,
        );
        reject(
          new Error(
            `Failed opening IndexedDb database ${this.databaseName} version ${this.databaseVersion}`,
            { cause: (evt.target as IDBOpenDBRequest).error },
          ),
        );
      };
      openReq.onsuccess = (evt) => {
        const db = (evt.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([this.objectStoreName], "readonly");
        const store = transaction.objectStore(this.objectStoreName);
        const getRequest: IDBRequest<{ data: Data } | undefined> = store.get(
          this.objectStoreDataKeyValue,
        );
        getRequest.onsuccess = () => {
          transaction.commit();
        };
        getRequest.onerror = (evt) => {
          this.logError(
            `Failed reading object from IndexedDb object store ${this.objectStoreName}`,
            (evt.target as IDBRequest).error,
          );
          transaction.abort();
        };
        transaction.oncomplete = () => {
          db.close();
          resolve(getRequest.result?.data ?? null);
        };
        transaction.onerror = () => {
          this.logError("IndexedDb transaction failed", transaction.error);
          db.close();
          reject(
            new Error("IndexedDb transaction failed", {
              cause: transaction.error,
            }),
          );
        };
        transaction.onabort = () => {
          this.logError("IndexedDb transaction aborted", transaction.error);
          db.close();
          reject(
            new Error("IndexedDb transaction aborted", {
              cause: transaction.error,
            }),
          );
        };
      };
    });
  }

  private logError(message: string, error: any) {
    console.group(message);
    console.error(error);
    console.groupEnd();
  }

  private static runTransactionSucceededCallbacks(callbacks: (() => void)[]) {
    callbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error(
          "Uncaught error running transaction succeeded callback",
          error,
        );
      }
    });
  }
}

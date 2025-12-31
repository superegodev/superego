import type { GlobalSettings } from "@superego/backend";
import type {
  DataRepositories,
  DataRepositoriesManager,
} from "@superego/executing-backend";
import type Data from "./Data.js";
import DemoDataRepositories from "./DemoDataRepositories.js";
import clone from "./utils/clone.js";

const OVERWRITE = "OVERWRITE";

export default class DemoDataRepositoriesManager
  implements DataRepositoriesManager
{
  private databaseVersion = 1;
  private objectStoreName = "data";
  private objectStoreDataKeyPath = "id";
  private objectStoreDataKeyValue = "data";
  private lock: string | null = null;

  constructor(
    private defaultGlobalSettings: GlobalSettings,
    private databaseName = "superego",
  ) {}

  async runInSerializableTransaction<ReturnValue>(
    fn: (
      repos: DataRepositories,
    ) => Promise<{ action: "commit" | "rollback"; returnValue: ReturnValue }>,
  ): Promise<ReturnValue> {
    const transactionId = crypto.randomUUID();
    let shouldAbort = false;
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
      flexsearchIndexes: [],
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
          "flexsearchIndexes",
          "globalSettings",
        ] as const
      ).forEach((property) => {
        Object.assign(transactionData[property], savepoints[name]![property]);
      });
      delete savepoints[name];
    };
    const repos = new DemoDataRepositories(
      transactionData,
      onWrite,
      createSavepoint,
      rollbackToSavepoint,
    );
    const { action, returnValue } = await fn(repos);
    repos.dispose();
    if (shouldAbort) {
      throw new Error("Transaction aborted");
    }
    if (action === "commit" && transactionData.version !== initialVersion) {
      this.lock = null;
      await this.writeData(clone(transactionData), initialVersion);
    }
    return returnValue;
  }

  private async writeData(data: Data, initialVersion: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const openReq = indexedDB.open(this.databaseName, this.databaseVersion);
      openReq.onupgradeneeded = (evt) => {
        const db = (evt.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.objectStoreName)) {
          db.createObjectStore(this.objectStoreName, {
            keyPath: this.objectStoreDataKeyPath,
          });
        }
      };
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
    return new Promise((resolve, reject) => {
      const openReq = indexedDB.open(this.databaseName, this.databaseVersion);
      openReq.onupgradeneeded = (evt) => {
        const db = (evt.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.objectStoreName)) {
          db.createObjectStore(this.objectStoreName, {
            keyPath: this.objectStoreDataKeyPath,
          });
        }
      };
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
}

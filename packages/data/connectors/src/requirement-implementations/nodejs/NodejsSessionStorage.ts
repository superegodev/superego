import type SessionStorage from "../../requirements/SessionStorage.js";

export default class NodejsSessionStorage implements SessionStorage {
  private storage: Record<string, string | null> = {};

  getItem(key: string): string | null {
    return this.storage[key] ?? null;
  }

  setItem(key: string, value: string | null): void {
    this.storage[key] = value;
  }
}

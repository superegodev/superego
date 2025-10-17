import type SessionStorage from "../../requirements/SessionStorage.js";

export default class BrowserSessionStorage implements SessionStorage {
  getItem(key: string): string | null {
    return sessionStorage.getItem(key);
  }

  setItem(key: string, value: string | null): void {
    if (value === null) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
    }
  }
}

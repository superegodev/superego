import type SessionStorage from "../../requirements/SessionStorage.js";
import { OAuth2PKCECodeVerifierNotFound } from "./errors.js";

export default class CodeVerifierStorage {
  constructor(
    private sessionStorage: SessionStorage,
    private connectorName: string,
  ) {}

  write(nonce: string, codeVerifier: string): void {
    this.sessionStorage.setItem(this.getStorageKey(nonce), codeVerifier);
  }

  read(nonce: string): string {
    const item = this.sessionStorage.getItem(this.getStorageKey(nonce));
    if (item === null) {
      throw new OAuth2PKCECodeVerifierNotFound(this.connectorName, nonce);
    }
    return JSON.parse(item);
  }

  clear(nonce: string): void {
    this.sessionStorage.setItem(this.getStorageKey(nonce), null);
  }

  private getStorageKey(nonce: string): string {
    return `${this.connectorName}_${nonce}`;
  }
}

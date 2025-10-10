export default interface SessionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string | null): void;
}

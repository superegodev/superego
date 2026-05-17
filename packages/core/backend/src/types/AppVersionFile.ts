export type AppVersionFileRole = "source" | "build" | "generated" | "config";

export default interface AppVersionFile {
  role: AppVersionFileRole;
  mimeType: string;
  content: string | Uint8Array<ArrayBuffer>;
}

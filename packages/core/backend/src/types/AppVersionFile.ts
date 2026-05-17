export type AppVersionFileRole = "source" | "build" | "projectConfig";

export default interface AppVersionFile {
  role: AppVersionFileRole;
  mimeType: string;
  content: string | Uint8Array<ArrayBuffer>;
}

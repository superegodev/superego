export default interface AppPermissions {
  modals: boolean;
  downloads: boolean;
  http: { allowedOrigins: string[] };
}

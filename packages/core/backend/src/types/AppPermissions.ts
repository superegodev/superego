/** Applies only to browser dialogs/downloads and the host HTTP API. */
export default interface AppPermissions {
  modals?: boolean | undefined;
  downloads?: boolean | undefined;
  http?: { allowedOrigins: string[] } | undefined;
}

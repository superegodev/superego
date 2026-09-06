/** Controls browser dialogs/downloads and the app document's connect-src policy. */
export default interface AppPermissions {
  modals?: boolean | undefined;
  downloads?: boolean | undefined;
  http?: { allowedOrigins: string[] } | undefined;
}

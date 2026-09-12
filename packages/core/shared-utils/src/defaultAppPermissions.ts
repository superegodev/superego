import type { AppPermissions } from "@superego/backend";

const defaultAppPermissions: AppPermissions = {
  modals: false,
  downloads: false,
  http: { allowedOrigins: [] },
};
export default defaultAppPermissions;

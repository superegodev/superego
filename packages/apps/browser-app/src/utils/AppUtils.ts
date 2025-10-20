import type { App, AppId } from "@superego/backend";

export default {
  findApp(apps: App[], appId: AppId): App | null {
    return apps.find(({ id }) => id === appId) ?? null;
  },
};

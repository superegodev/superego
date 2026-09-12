import type { AppPermissions } from "@superego/backend";

export type RHFAppPermissions = Omit<AppPermissions, "http"> & {
  http: {
    allowedOrigins: { value: string }[];
  };
};

export default {
  toRhfAppPermissions(permissions: AppPermissions): RHFAppPermissions {
    return {
      ...permissions,
      http: {
        allowedOrigins: permissions.http.allowedOrigins.map((value) => ({
          value,
        })),
      },
    };
  },

  fromRhfAppPermissions(permissions: RHFAppPermissions): AppPermissions {
    return {
      ...permissions,
      http: {
        allowedOrigins: permissions.http.allowedOrigins.map(
          ({ value }) => value,
        ),
      },
    };
  },
};

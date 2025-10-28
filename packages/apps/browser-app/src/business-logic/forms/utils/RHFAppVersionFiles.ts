import type { AppVersion } from "@superego/backend";

const dotReplacement = "__DOT__" as const;

type DotsToUnderscores<S extends string> =
  S extends `${infer Head}.${infer Tail}`
    ? `${Head}${typeof dotReplacement}${DotsToUnderscores<Tail>}`
    : S;

export type RHFAppVersionFiles = {
  [K in keyof AppVersion["files"] as K extends string
    ? DotsToUnderscores<K>
    : K]: AppVersion["files"][K];
};

export default {
  fromRhfAppVersionFiles(
    rhfAppVersionFiles: RHFAppVersionFiles,
  ): AppVersion["files"] {
    return Object.fromEntries(
      Object.entries(rhfAppVersionFiles).map(([key, value]) => [
        key.replaceAll(dotReplacement, "."),
        value,
      ]),
    ) as AppVersion["files"];
  },

  toRhfAppVersionFiles(
    appVersionFiles: AppVersion["files"],
  ): RHFAppVersionFiles {
    return Object.fromEntries(
      Object.entries(appVersionFiles).map(([key, value]) => [
        key.replaceAll(".", dotReplacement),
        value,
      ]),
    ) as RHFAppVersionFiles;
  },
};

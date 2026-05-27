import type { AppDefinition, AppVersion } from "@superego/backend";

const dotReplacement = "__DOT__" as const;

type DotsToUnderscores<S extends string> =
  S extends `${infer Head}.${infer Tail}`
    ? `${Head}${typeof dotReplacement}${DotsToUnderscores<Tail>}`
    : S;

export type RHFAppVersionFiles = {
  [K in keyof AppDefinition["files"] as K extends string
    ? DotsToUnderscores<K>
    : K]: AppDefinition["files"][K];
};

export default {
  fromRhfAppVersionFiles(
    rhfAppVersionFiles: RHFAppVersionFiles,
  ): AppDefinition["files"] {
    return Object.fromEntries(
      Object.entries(rhfAppVersionFiles).map(([key, value]) => [
        key.replaceAll(dotReplacement, "."),
        value,
      ]),
    ) as AppDefinition["files"];
  },

  toRhfAppVersionFiles(
    appVersionFiles: AppVersion["files"],
  ): RHFAppVersionFiles {
    return Object.fromEntries(
      Object.entries({ "/main.tsx": appVersionFiles["/main.tsx"] }).map(
        ([key, value]) => [key.replaceAll(".", dotReplacement), value],
      ),
    ) as RHFAppVersionFiles;
  },
};

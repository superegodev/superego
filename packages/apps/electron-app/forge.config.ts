import fs from "node:fs";
import { join, resolve } from "node:path";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { MakerZIP } from "@electron-forge/maker-zip";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { PublisherGithub } from "@electron-forge/publisher-github";
import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerAppImage } from "@reforged/maker-appimage";

const { GITHUB_REF: githubRef } = process.env;
const isTag = githubRef !== undefined && githubRef.startsWith("refs/tags/v");

export default {
  hooks: {
    async prePackage() {
      const dirname = import.meta.dirname;
      const repoNodeModules = resolve(dirname, "../../../node_modules");
      const localNodeModules = resolve(dirname, "node_modules");

      const externalizedPackages = ["typescript", "@typescript/vfs"];
      for (const pkg of externalizedPackages) {
        const src = join(repoNodeModules, pkg);
        const dest = join(localNodeModules, pkg);
        fs.mkdirSync(localNodeModules, { recursive: true });
        fs.rmSync(dest, { recursive: true, force: true });
        fs.cpSync(src, dest, { recursive: true, dereference: true });
      }
    },
  },
  packagerConfig: {
    appBundleId: "dev.superego.superego",
    executableName: "superego",
    asar: true,
    ignore: [
      "src",
      "electron.vite.config.ts",
      "forge.config.ts",
      "tsconfig.json",
    ],
    icon: "./assets/icon",
    osxSign: isTag ? {} : undefined,
    extendInfo: {
      CFBundleName: "Superego",
    },
  },
  makers: [
    new MakerZIP({}, ["darwin"]),
    new MakerRpm({
      options: {
        name: "superego",
        bin: "superego",
        icon: "./assets/icon.png",
        categories: ["Office"],
      },
    }),
    new MakerDeb({
      options: {
        name: "superego",
        bin: "superego",
        icon: "./assets/icon.png",
        categories: ["Office"],
      },
    }),
    new MakerAppImage({
      options: {
        name: "superego",
        bin: "superego",
        icon: "./assets/icon.png",
        categories: ["Office"],
      },
    }),
  ],
  plugins: [
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  publishers: [
    new PublisherGithub({
      repository: {
        owner: "superegodev",
        name: "superego",
      },
      draft: false,
      prerelease: false,
      force: false,
    }),
  ],
} satisfies ForgeConfig;

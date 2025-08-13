import type { Configuration } from "electron-builder";

const { GITHUB_REF: githubRef } = process.env;
const isTag = githubRef !== undefined && githubRef.startsWith("refs/tags/v");

export default {
  appId: "dev.superego.app",
  productName: "superego",
  directories: {
    output: "out",
  },
  files: ["dist/**/*", "!**/node_modules/**/*"],
  asar: true,
  mac: {
    category: "public.app-category.productivity",
    icon: "./assets/icon.icns",
    target: [
      {
        target: "zip",
        arch: ["arm64"],
      },
    ],
  },
  linux: {
    icon: "./assets/icon.png",
    category: "Office",
    target: [
      {
        target: "AppImage",
        arch: ["x64"],
      },
    ],
  },
  publish: {
    provider: "github",
    owner: "superegodev",
    repo: "superego",
    releaseType: "release",
  },
} satisfies Configuration;

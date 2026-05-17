import type AppVersion from "./types/AppVersion.js";
import type AppVersionFile from "./types/AppVersionFile.js";
import type ValidationIssue from "./types/ValidationIssue.js";

export const APP_VERSION_ENTRYPOINT = "/dist/index.html" as const;

export const APP_VERSION_FILE_SIZE_LIMIT_BYTES = 10 * 1024 * 1024;
export const APP_VERSION_EDITABLE_FILES_SIZE_LIMIT_BYTES = 50 * 1024 * 1024;
export const APP_VERSION_BUILD_FILES_SIZE_LIMIT_BYTES = 50 * 1024 * 1024;
export const APP_VERSION_TOTAL_FILES_SIZE_LIMIT_BYTES = 100 * 1024 * 1024;

export const RESERVED_CHECKOUT_PATHS = [
  "/superego/",
  "/superego.app.json",
] as const;

const projectConfigFileNames = new Set([
  ".prettierrc",
  ".superegoignore",
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
]);

const projectConfigPrefixes = [
  "eslint.config.",
  "postcss.config.",
  "prettier.config.",
  "tailwind.config.",
  "tsconfig",
  "vite.config.",
];

export function normalizeAppVersionPath(path: string): `/${string}` | null {
  if (!path.startsWith("/") || path.length === 1) {
    return null;
  }
  if (path.endsWith("/") || path.includes("\\") || path.includes("//")) {
    return null;
  }
  if (/%2f|%5c/i.test(path)) {
    return null;
  }
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(path);
  } catch {
    return null;
  }
  if (
    decodedPath !== path ||
    decodedPath.includes("\\") ||
    decodedPath.includes("//")
  ) {
    return null;
  }
  const segments = path.slice(1).split("/");
  if (
    segments.some(
      (segment) => segment.length === 0 || segment === "." || segment === "..",
    )
  ) {
    return null;
  }
  return path as `/${string}`;
}

export function isBuildPath(path: string): path is `/dist/${string}` {
  return path.startsWith("/dist/") && normalizeAppVersionPath(path) !== null;
}

export function isReservedCheckoutPath(path: string): boolean {
  return path === "/superego.app.json" || path.startsWith("/superego/");
}

export function classifyAppProjectPath(
  path: string,
): AppVersionFile["role"] | null {
  const normalizedPath = normalizeAppVersionPath(path);
  if (!normalizedPath || isReservedCheckoutPath(normalizedPath)) {
    return null;
  }
  if (isBuildPath(normalizedPath)) {
    return "build";
  }
  const fileName = normalizedPath.slice(normalizedPath.lastIndexOf("/") + 1);
  if (
    projectConfigFileNames.has(fileName) ||
    projectConfigPrefixes.some((prefix) => fileName.startsWith(prefix))
  ) {
    return "projectConfig";
  }
  return "source";
}

export function getBuildFiles(files: AppVersion["files"]): AppVersion["files"] {
  return Object.fromEntries(
    Object.entries(files).filter(
      ([path, file]) => file.role === "build" && isBuildPath(path),
    ),
  ) as AppVersion["files"];
}

export function getEditableFiles(
  files: AppVersion["files"],
): AppVersion["files"] {
  return Object.fromEntries(
    Object.entries(files).filter(
      ([path, file]) =>
        (file.role === "source" || file.role === "projectConfig") &&
        normalizeAppVersionPath(path) !== null &&
        !isReservedCheckoutPath(path),
    ),
  ) as AppVersion["files"];
}

export function getVersionBuildFile(
  files: AppVersion["files"],
  path: string,
): AppVersionFile | null {
  const normalizedPath = normalizeAppVersionPath(path);
  if (!normalizedPath || !isBuildPath(normalizedPath)) {
    return null;
  }
  const file = files[normalizedPath];
  return file?.role === "build" ? file : null;
}

export function validateAppVersionFiles(
  entrypoint: AppVersion["entrypoint"],
  files: AppVersion["files"],
  options: { appId?: string | null; appVersionId?: string | null } = {},
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  let buildFilesSize = 0;
  let editableFilesSize = 0;
  let totalFilesSize = 0;
  let hasSourceFile = false;

  if (entrypoint !== APP_VERSION_ENTRYPOINT) {
    issues.push({
      message: `App entrypoint must be ${APP_VERSION_ENTRYPOINT}.`,
      path: [{ key: "entrypoint" }],
    });
  }

  for (const [path, file] of Object.entries(files)) {
    const normalizedPath = normalizeAppVersionPath(path);
    const issuePath = [{ key: "files" }, { key: path }];
    if (!normalizedPath) {
      issues.push({
        message: `Invalid app file path: ${path}.`,
        path: issuePath,
      });
      continue;
    }
    if (isReservedCheckoutPath(normalizedPath)) {
      issues.push({
        message: `Reserved checkout file must not be persisted: ${normalizedPath}.`,
        path: issuePath,
      });
    }
    const expectedRole = classifyAppProjectPath(normalizedPath);
    if (expectedRole && file.role !== expectedRole) {
      issues.push({
        message: `App file ${normalizedPath} must use role ${expectedRole}.`,
        path: [...issuePath, { key: "role" }],
      });
    }
    if (file.role === "build" && !isBuildPath(normalizedPath)) {
      issues.push({
        message: "Build files must be under /dist/.",
        path: [...issuePath, { key: "role" }],
      });
    }
    if (isBuildPath(normalizedPath) && file.role !== "build") {
      issues.push({
        message: "/dist/ files must use the build role.",
        path: [...issuePath, { key: "role" }],
      });
    }
    if (file.role === "source") {
      hasSourceFile = true;
    }

    const size = fileContentSize(file.content);
    if (size > APP_VERSION_FILE_SIZE_LIMIT_BYTES) {
      issues.push({
        message: `App file exceeds the ${APP_VERSION_FILE_SIZE_LIMIT_BYTES} byte per-file limit.`,
        path: issuePath,
      });
    }
    if (file.role === "build") {
      buildFilesSize += size;
    } else {
      editableFilesSize += size;
    }
    totalFilesSize += size;
  }

  const entrypointFile = files[APP_VERSION_ENTRYPOINT];
  if (!entrypointFile) {
    issues.push({
      message: `Missing ${APP_VERSION_ENTRYPOINT}.`,
      path: [{ key: "files" }, { key: APP_VERSION_ENTRYPOINT }],
    });
  } else {
    if (entrypointFile.role !== "build") {
      issues.push({
        message: "Entrypoint file must use the build role.",
        path: [
          { key: "files" },
          { key: APP_VERSION_ENTRYPOINT },
          { key: "role" },
        ],
      });
    }
    if (entrypointFile.mimeType !== "text/html") {
      issues.push({
        message: "Entrypoint file must have MIME type text/html.",
        path: [
          { key: "files" },
          { key: APP_VERSION_ENTRYPOINT },
          { key: "mimeType" },
        ],
      });
    }
  }

  if (!hasSourceFile) {
    issues.push({
      message: "App version must include at least one source file.",
      path: [{ key: "files" }],
    });
  }
  if (editableFilesSize > APP_VERSION_EDITABLE_FILES_SIZE_LIMIT_BYTES) {
    issues.push({
      message: `Editable app files exceed the ${APP_VERSION_EDITABLE_FILES_SIZE_LIMIT_BYTES} byte limit.`,
      path: [{ key: "files" }],
    });
  }
  if (buildFilesSize > APP_VERSION_BUILD_FILES_SIZE_LIMIT_BYTES) {
    issues.push({
      message: `Build app files exceed the ${APP_VERSION_BUILD_FILES_SIZE_LIMIT_BYTES} byte limit.`,
      path: [{ key: "files" }],
    });
  }
  if (totalFilesSize > APP_VERSION_TOTAL_FILES_SIZE_LIMIT_BYTES) {
    issues.push({
      message: `App files exceed the ${APP_VERSION_TOTAL_FILES_SIZE_LIMIT_BYTES} byte total limit.`,
      path: [{ key: "files" }],
    });
  }

  void options;
  return issues;
}

export function fileContentSize(content: AppVersionFile["content"]): number {
  return typeof content === "string"
    ? new TextEncoder().encode(content).byteLength
    : content.byteLength;
}

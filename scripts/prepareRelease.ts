import { $ } from "zx";
import pkg from "../package.json" with { type: "json" };

// Ensure we're on the main branch.
const branch = $.sync`git branch --show-current`.stdout.trim();
if (branch !== "main") {
  console.error(
    `You need to be on the main branch to release a new version. Current branch is ${branch}.`,
  );
  process.exit(1);
}

// Get the next version, based on the current date.
const nextVersion = (() => {
  const [currentMajor, currentMinor, currentPatch] = pkg.version
    .split(".")
    .map(Number);

  const now = new Date();
  const nextMajor = now.getUTCFullYear();
  // Months are zero-based, but we want 1-12.
  const nextMinor = now.getUTCMonth() + 1;
  const nextPatch =
    currentMajor === nextMajor && currentMinor === nextMinor
      ? currentPatch + 1
      : 0;

  return `${nextMajor}.${nextMinor}.${nextPatch}`;
})();

// Bump all packages to the next version.
$.sync`yarn workspaces foreach --all --topological-dev version "${nextVersion}"`;

// Commit and tag changes.
const tag = `v${nextVersion}`;
$.sync`git commit -am "${nextVersion}"`;
$.sync`git tag -m "${tag}" "${tag}"`;

import { discoverSnapshots } from "./discoverSnapshots.ts";
import { evaluateSnapshot } from "./evaluateSnapshot.ts";
import type { EvaluationResult } from "./types.ts";

function getConfig() {
  const baseUrl = process.env["SUPEREGO_TESTS_CHAT_COMPLETIONS_BASE_URL"];
  const apiKey = process.env["SUPEREGO_TESTS_CHAT_COMPLETIONS_API_KEY"];
  const model = process.env["SUPEREGO_TESTS_CHAT_COMPLETIONS_MODEL"];

  if (!baseUrl) {
    console.error(
      "Missing environment variable: SUPEREGO_TESTS_CHAT_COMPLETIONS_BASE_URL",
    );
    process.exit(1);
  }
  if (!apiKey) {
    console.error(
      "Missing environment variable: SUPEREGO_TESTS_CHAT_COMPLETIONS_API_KEY",
    );
    process.exit(1);
  }
  if (!model) {
    console.error(
      "Missing environment variable: SUPEREGO_TESTS_CHAT_COMPLETIONS_MODEL",
    );
    process.exit(1);
  }

  return { baseUrl, apiKey, model };
}

async function main() {
  const config = getConfig();
  const snapshots = discoverSnapshots();

  if (snapshots.length === 0) {
    console.error("No snapshots with requirements found.");
    process.exit(1);
  }

  console.log(`Evaluating ${snapshots.length} snapshots...\n`);

  const report: EvaluationResult[] = [];

  for (const snapshot of snapshots) {
    const result = await evaluateSnapshot(snapshot, config);
    report.push(result);
    const status = result.pass ? "pass" : "FAIL";
    console.log(`${result.testFileName}: ${result.stepIndex}: ${status}`);
    if (!result.pass) {
      console.log(`  Reason: ${result.reason}`);
    }
  }

  const allPassed = report.every((r) => r.pass);

  console.log();
  if (allPassed) {
    console.log("All snapshots passed evaluation.");
    process.exit(0);
  } else {
    const failCount = report.filter((r) => !r.pass).length;
    console.error(
      `${failCount} of ${report.length} snapshots failed evaluation.`,
    );
    process.exit(1);
  }
}

main();

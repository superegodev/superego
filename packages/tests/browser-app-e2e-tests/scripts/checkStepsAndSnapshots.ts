import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const scenariosDirectory = resolve(import.meta.dirname, "../src/scenarios");

interface ScenarioFile {
  fileName: string;
  scenarioNumber: string;
  content: string;
}

interface CheckError {
  file: string;
  message: string;
}

function readScenarios(): ScenarioFile[] {
  const entries = readdirSync(scenariosDirectory);
  const testFiles = entries.filter((entry) => entry.endsWith(".test.ts"));
  return testFiles.map((fileName) => {
    const filePath = join(scenariosDirectory, fileName);
    const content = readFileSync(filePath, "utf-8");
    const scenarioNumber = fileName.slice(0, 3);
    return { fileName, scenarioNumber, content };
  });
}

function titleToSlug(title: string): string {
  return title.toLowerCase().replace(/\s+/g, "-");
}

function checkSingleTestMatchingFileName(scenario: ScenarioFile): CheckError[] {
  const testMatches = [...scenario.content.matchAll(/^\s*test\("([^"]+)"/gm)];
  if (testMatches.length === 0) {
    return [{ file: scenario.fileName, message: "No test found" }];
  }
  if (testMatches.length > 1) {
    return [
      {
        file: scenario.fileName,
        message: `Expected 1 test, found ${testMatches.length}`,
      },
    ];
  }
  const testTitle = testMatches[0]![1]!;
  const titleMatch = testTitle.match(/^(\d{3})\. (.+)$/);
  if (!titleMatch) {
    return [
      {
        file: scenario.fileName,
        message: `Test title "${testTitle}" does not match "\\d\\d\\d. Title" pattern`,
      },
    ];
  }
  const titleNumber = titleMatch[1]!;
  const titleText = titleMatch[2]!;
  const errors: CheckError[] = [];
  if (titleNumber !== scenario.scenarioNumber) {
    errors.push({
      file: scenario.fileName,
      message: `Test title number "${titleNumber}" does not match file name number "${scenario.scenarioNumber}"`,
    });
  }
  const expectedSlug = titleToSlug(titleText);
  const fileSlug = scenario.fileName.replace(/^\d{3}-/, "").replace(/\.test\.ts$/, "");
  if (fileSlug !== expectedSlug) {
    errors.push({
      file: scenario.fileName,
      message: `File slug "${fileSlug}" does not match test title slug "${expectedSlug}"`,
    });
  }
  return errors;
}

function extractSteps(
  scenario: ScenarioFile,
): { title: string; body: string }[] {
  const steps: { title: string; body: string }[] = [];
  const stepPattern = /test\.step\("([^"]+)"/g;
  for (
    let match = stepPattern.exec(scenario.content);
    match !== null;
    match = stepPattern.exec(scenario.content)
  ) {
    const stepStart = match.index + match[0].length;
    // Extract the body until the closing of test.step (find balanced parens)
    let depth = 1;
    let position = stepStart;
    // Skip to the first opening paren after the arrow function
    while (position < scenario.content.length && depth > 0) {
      const character = scenario.content[position];
      if (character === "(") depth++;
      if (character === ")") depth--;
      position++;
    }
    const body = scenario.content.slice(stepStart, position);
    steps.push({ title: match[1]!, body });
  }
  return steps;
}

function checkStepTitle(
  scenario: ScenarioFile,
  stepTitle: string,
  expectedIndex: number,
): CheckError[] {
  const expectedPrefix = String(expectedIndex).padStart(2, "0");
  const prefixPattern = /^(\d{2})\./;
  const prefixMatch = stepTitle.match(prefixPattern);
  if (!prefixMatch) {
    return [
      {
        file: scenario.fileName,
        message: `Step "${stepTitle}" title does not begin with \\d\\d.`,
      },
    ];
  }
  if (prefixMatch[1] !== expectedPrefix) {
    return [
      {
        file: scenario.fileName,
        message: `Step "${stepTitle}" has prefix ${prefixMatch[1]}, expected ${expectedPrefix}`,
      },
    ];
  }
  return [];
}

function checkStepAssertion(
  scenario: ScenarioFile,
  stepTitle: string,
  stepBody: string,
  expectedIndex: number,
): CheckError[] {
  const errors: CheckError[] = [];
  const assertionMatches = [
    ...stepBody.matchAll(/VisualEvaluator\.expectToSee\(\s*"([^"]+)"/g),
  ];
  if (assertionMatches.length === 0) {
    errors.push({
      file: scenario.fileName,
      message: `Step "${stepTitle}" has no VisualEvaluator.expectToSee() assertion`,
    });
    return errors;
  }
  if (assertionMatches.length > 1) {
    errors.push({
      file: scenario.fileName,
      message: `Step "${stepTitle}" has ${assertionMatches.length} VisualEvaluator.expectToSee() assertions, expected 1`,
    });
    return errors;
  }
  const snapshotName = assertionMatches[0]![1]!;
  const expectedSnapshotName = `${String(expectedIndex).padStart(2, "0")}.png`;
  if (snapshotName !== expectedSnapshotName) {
    errors.push({
      file: scenario.fileName,
      message: `Step "${stepTitle}" snapshot name is "${snapshotName}", expected "${expectedSnapshotName}"`,
    });
  }
  return errors;
}

function checkSnapshots(
  scenario: ScenarioFile,
  stepCount: number,
): CheckError[] {
  const errors: CheckError[] = [];
  const snapshotsDirectory = join(
    scenariosDirectory,
    `${scenario.fileName}-snapshots`,
  );

  if (!existsSync(snapshotsDirectory)) {
    errors.push({
      file: scenario.fileName,
      message: "Snapshots directory does not exist",
    });
    return errors;
  }

  const snapshotFiles = readdirSync(snapshotsDirectory).filter((file) =>
    file.endsWith(".png"),
  );

  const expectedStepNumbers = new Set(
    Array.from({ length: stepCount }, (_, index) =>
      String(index).padStart(2, "0"),
    ),
  );

  const snapshotStepNumbers = new Set<string>();
  for (const snapshotFile of snapshotFiles) {
    const stepNumber = snapshotFile.split("-")[0]!;
    snapshotStepNumbers.add(stepNumber);
  }

  for (const expected of expectedStepNumbers) {
    if (!snapshotStepNumbers.has(expected)) {
      errors.push({
        file: scenario.fileName,
        message: `Missing snapshot for step ${expected}`,
      });
    }
  }

  for (const snapshotFile of snapshotFiles) {
    const stepNumber = snapshotFile.split("-")[0]!;
    if (!expectedStepNumbers.has(stepNumber)) {
      errors.push({
        file: scenario.fileName,
        message: `Superfluous snapshot "${snapshotFile}"`,
      });
    }
  }

  return errors;
}

function checkScenario(scenario: ScenarioFile): CheckError[] {
  const errors: CheckError[] = [];

  errors.push(...checkSingleTestMatchingFileName(scenario));
  if (errors.length > 0) {
    return errors;
  }

  const steps = extractSteps(scenario);
  if (steps.length === 0) {
    errors.push({ file: scenario.fileName, message: "No steps found" });
    return errors;
  }

  for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
    const step = steps[stepIndex]!;
    errors.push(...checkStepTitle(scenario, step.title, stepIndex));
    errors.push(
      ...checkStepAssertion(scenario, step.title, step.body, stepIndex),
    );
  }

  errors.push(...checkSnapshots(scenario, steps.length));

  return errors;
}

function main(): void {
  const scenarios = readScenarios();
  if (scenarios.length === 0) {
    console.error("No scenario files found");
    process.exit(1);
  }

  const allErrors: CheckError[] = [];
  for (const scenario of scenarios) {
    allErrors.push(...checkScenario(scenario));
  }

  if (allErrors.length > 0) {
    console.error("Steps and snapshots check failed:\n");
    for (const error of allErrors) {
      console.error(`  ${error.file}: ${error.message}`);
    }
    console.error();
    process.exit(1);
  }

  console.log(
    `All checks passed (${scenarios.length} scenarios, all steps valid)`,
  );
}

main();

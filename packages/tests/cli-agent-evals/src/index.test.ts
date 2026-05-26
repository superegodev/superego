import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AppType } from "@superego/backend";
import { assert, describe, expect, test } from "vitest";
import {
  expectDocumentContentIncludes,
  expectSchemaHasConcepts,
  expectSingleChangedDocument,
  findAppByName,
  findCollectionByName,
  findDocuments,
} from "./harness/assertions.js";
import {
  createEvalBackend,
  seedExpenseDocuments,
  seedExpensesCollection,
  seedLegacyExpenseDocuments,
  seedLegacyExpensesCollection,
} from "./harness/backend.js";
import { runAgent } from "./harness/runAgent.js";
import { readDatabaseSnapshot, stableSnapshot } from "./harness/snapshot.js";
import { createEvalWorkspace } from "./harness/workspace.js";

const describeWithAgent = process.env["SUPEREGO_CLI_AGENT_COMMAND"]
  ? describe
  : describe.skip;

describeWithAgent("CLI agent evals", () => {
  test("inspects an existing database", async () => {
    // Setup SUT
    const workspace = createEvalWorkspace();
    const backend = createEvalBackend(workspace.databaseFile);
    const collection = await seedExpensesCollection(backend);
    await seedExpenseDocuments(backend, collection.id);
    const before = stableSnapshot(await readDatabaseSnapshot(backend));

    // Exercise
    const result = await runAgent(
      workspace,
      [
        "Use the `superego` CLI to inspect the local database.",
        "Summarize the collection names and the expense documents you find.",
        "Do not mutate the database.",
      ].join("\n"),
    );

    // Verify
    const after = stableSnapshot(await readDatabaseSnapshot(backend));
    expect(after).toBe(before);
    expect(result.stdout + result.stderr).toMatch(/Expenses/i);
    expect(result.stdout + result.stderr).toMatch(/Amtrak/i);
  });

  test("creates a collection category", async () => {
    // Setup SUT
    const workspace = createEvalWorkspace();
    const backend = createEvalBackend(workspace.databaseFile);

    // Exercise
    await runAgent(
      workspace,
      [
        "Use the `superego` CLI to create a collection category named Finance.",
        "Do not create any other categories.",
      ].join("\n"),
    );

    // Verify
    const snapshot = await readDatabaseSnapshot(backend);
    expect(snapshot.categories).toHaveLength(1);
    expect(snapshot.categories[0]!.name).toBe("Finance");
  });

  test("creates an expenses collection", async () => {
    // Setup SUT
    const workspace = createEvalWorkspace();
    const backend = createEvalBackend(workspace.databaseFile);

    // Exercise
    await runAgent(
      workspace,
      [
        "Use the `superego` CLI to create an expenses collection for personal expense tracking.",
        "The schema must support date, amount, currency, merchant or payee, category, payment method, reimbursable flag, and notes.",
        "Do not add documents.",
      ].join("\n"),
    );

    // Verify
    const snapshot = await readDatabaseSnapshot(backend);
    const collection = findCollectionByName(snapshot, /expense/i);
    expectSchemaHasConcepts(collection, [
      ["date"],
      ["amount"],
      ["currency"],
      ["merchant", "payee", "vendor"],
      ["category"],
      ["payment", "method", "paymentMethod"],
      ["reimbursable"],
      ["notes"],
    ]);
    expect(findDocuments(snapshot, collection.id)).toHaveLength(0);
  });

  test("creates documents in an existing collection", async () => {
    // Setup SUT
    const workspace = createEvalWorkspace();
    const backend = createEvalBackend(workspace.databaseFile);
    const collection = await seedExpensesCollection(backend);

    // Exercise
    await runAgent(
      workspace,
      [
        "Use the `superego` CLI to add these expenses to the existing Expenses collection:",
        "- 2026-02-01, 18.50 USD, Blue Bottle, Coffee, Credit Card, not reimbursable, Morning coffee beans.",
        "- 2026-02-03, 86.20 USD, Amtrak, Travel, Credit Card, reimbursable, Client visit train ticket.",
        "- 2026-02-05, 42.00 USD, Local Market, Groceries, Debit Card, not reimbursable, Weekly groceries.",
      ].join("\n"),
    );

    // Verify
    const snapshot = await readDatabaseSnapshot(backend);
    const documents = findDocuments(snapshot, collection.id);
    expect(documents).toHaveLength(3);
    expectDocumentContentIncludes(documents, {
      date: "2026-02-03",
      amount: 86.2,
      merchant: "Amtrak",
      category: "Travel",
    });
  });

  test("searches documents without mutating data", async () => {
    // Setup SUT
    const workspace = createEvalWorkspace();
    const backend = createEvalBackend(workspace.databaseFile);
    const collection = await seedExpensesCollection(backend);
    await seedExpenseDocuments(backend, collection.id);
    const before = stableSnapshot(await readDatabaseSnapshot(backend));

    // Exercise
    const result = await runAgent(
      workspace,
      [
        "Use the `superego` CLI to find the expense over 50 USD.",
        "Answer with the merchant, amount, and category.",
        "Do not mutate the database.",
      ].join("\n"),
    );

    // Verify
    const after = stableSnapshot(await readDatabaseSnapshot(backend));
    expect(after).toBe(before);
    expect(result.stdout + result.stderr).toMatch(/Amtrak/i);
    expect(result.stdout + result.stderr).toMatch(/\b86(?:\.2|\.20)?\b/);
    expect(result.stdout + result.stderr).toMatch(/\bTravel\b/i);
  });

  test("updates one document", async () => {
    // Setup SUT
    const workspace = createEvalWorkspace();
    const backend = createEvalBackend(workspace.databaseFile);
    const collection = await seedExpensesCollection(backend);
    await seedExpenseDocuments(backend, collection.id);
    const beforeDocuments = findDocuments(
      await readDatabaseSnapshot(backend),
      collection.id,
    );

    // Exercise
    await runAgent(
      workspace,
      [
        "Use the `superego` CLI to correct the Amtrak expense amount from 86.20 to 91.20.",
        "Only change that one document.",
      ].join("\n"),
    );

    // Verify
    const snapshot = await readDatabaseSnapshot(backend);
    const afterDocuments = findDocuments(snapshot, collection.id);
    expect(afterDocuments).toHaveLength(beforeDocuments.length);
    expectSingleChangedDocument(beforeDocuments, afterDocuments);
    expectDocumentContentIncludes(afterDocuments, {
      merchant: "Amtrak",
      amount: 91.2,
    });
  });

  test("creates a new collection version", async () => {
    // Setup SUT
    const workspace = createEvalWorkspace();
    const backend = createEvalBackend(workspace.databaseFile);
    const collection = await seedLegacyExpensesCollection(backend);
    await seedLegacyExpenseDocuments(backend, collection.id);

    // Exercise
    await runAgent(
      workspace,
      [
        "Use the `superego` CLI to add a required paymentMethod field to the Expenses collection.",
        "Create a new collection version and migrate existing documents by setting paymentMethod to Unknown.",
        "Preserve every existing field value.",
      ].join("\n"),
    );

    // Verify
    const snapshot = await readDatabaseSnapshot(backend);
    const updatedCollection = findCollectionByName(snapshot, /expense/i);
    expect(updatedCollection.latestVersion.id).not.toBe(
      collection.latestVersion.id,
    );
    expectSchemaHasConcepts(updatedCollection, [["paymentMethod", "payment"]]);
    const documents = findDocuments(snapshot, updatedCollection.id);
    expectDocumentContentIncludes(documents, {
      merchant: "Amtrak",
      paymentMethod: "Unknown",
    });
  });

  test("executes a TypeScript function over documents", async () => {
    // Setup SUT
    const workspace = createEvalWorkspace();
    const backend = createEvalBackend(workspace.databaseFile);
    const collection = await seedExpensesCollection(backend);
    await seedExpenseDocuments(backend, collection.id);
    const before = stableSnapshot(await readDatabaseSnapshot(backend));

    // Exercise
    const result = await runAgent(
      workspace,
      [
        "Use the `superego` CLI documents execute-typescript-function command to calculate total spend by category for the Expenses collection.",
        "Report the totals in your final answer.",
        "Do not mutate the database.",
      ].join("\n"),
    );

    // Verify
    const after = stableSnapshot(await readDatabaseSnapshot(backend));
    expect(after).toBe(before);
    expect(result.stdout + result.stderr).toMatch(/Coffee/i);
    expect(result.stdout + result.stderr).toMatch(/\b18(?:\.5|\.50)?\b/);
    expect(result.stdout + result.stderr).toMatch(/\bTravel\b/i);
    expect(result.stdout + result.stderr).toMatch(/\b86(?:\.2|\.20)?\b/);
  });

  test("initializes and checks an app project", async () => {
    // Setup SUT
    const workspace = createEvalWorkspace();
    const backend = createEvalBackend(workspace.databaseFile);
    const collection = await seedExpensesCollection(backend);

    // Exercise
    await runAgent(
      workspace,
      [
        "Use the `superego` CLI to create a local app project at ./expenses-app.",
        `Name it Expenses App and target collection ${collection.id}.`,
        "Run the CLI app validation command and leave the project on disk.",
      ].join("\n"),
    );

    // Verify
    const appPath = join(workspace.workDir, "expenses-app");
    expect(existsSync(join(appPath, "app.json"))).toBe(true);
    expect(existsSync(join(appPath, "main.tsx"))).toBe(true);
    expect(readFileSync(join(appPath, "app.json"), "utf8")).toContain(
      collection.id,
    );
  });

  test("checks out, changes, and commits an app", async () => {
    // Setup SUT
    const workspace = createEvalWorkspace();
    const backend = createEvalBackend(workspace.databaseFile);
    const collection = await seedExpensesCollection(backend);
    const createAppResult = await backend.apps.create({
      type: AppType.CollectionView,
      name: "Expenses Dashboard",
      targetCollectionIds: [collection.id],
      files: {
        "/main.tsx": {
          source: [
            'import React from "react";',
            "",
            "export default function App(): React.ReactElement | null {",
            "  return null;",
            "}",
            "",
          ].join("\n"),
          compiled: "export default function App() { return null; }",
        },
      },
    });
    assert.isTrue(createAppResult.success);

    // Exercise
    await runAgent(
      workspace,
      [
        `Use the \`superego\` CLI to check out app ${createAppResult.data.id} into ./expenses-dashboard.`,
        "Change the app so main.tsx renders the exact text Expense Review.",
        "Run status, then commit the app with the CLI.",
      ].join("\n"),
    );

    // Verify
    const snapshot = await readDatabaseSnapshot(backend);
    const app = findAppByName(snapshot.apps, /Expenses Dashboard/i);
    expect(app.latestVersion.id).not.toBe(
      createAppResult.data.latestVersion.id,
    );
    expect(app.latestVersion.files["/main.tsx"].source).toContain(
      "Expense Review",
    );
  });
});

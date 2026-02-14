---
name: writing-browser-app-e2e-tests
description: Write a Playwright + Midscene e2e test in the browser-app-e2e-tests package.
---

# Writing browser-app e2e tests

## When to use this skill

When you need to write a browser-app e2e test in
`packages/tests/browser-app-e2e-tests`.

## Base instructions

- Directory: `packages/tests/browser-app-e2e-tests/src/scenarios`
- Test title: three-digit identifier + dot + short description of the test
- File name: three-digit sequential identifier + `-` +
  snake-cased-short-description + `.test.ts`

## Midscene-first approach

- Use `test` from `src/fixture.ts` (it extends Playwright with Midscene APIs).
- Prefer Midscene actions for interactions:
  - `aiTap`
  - `aiInput`
  - other Midscene AI actions when needed
- Use Midscene assertions (`aiAssert`) for verification.
- Do **not** use screenshot assertions.
- Do **not** use custom locator/action helper modules.

## Setup routines

Reusable setup logic lives in `packages/tests/browser-app-e2e-tests/src/routines`.
Only these routines should exist and be used:

- `createCollection`
- `createContact`

Both routines must setup data programmatically through `page.evaluate` and the
in-browser backend APIs. They should not perform navigation or other browser UI
interactions.

## Test structure

Tests should be goal-oriented scenarios with deterministic setup and clear
verification of user-visible outcomes.

- Start from a known state (typically `page.goto("/")` and backend readiness).
- Use routines only for data setup.
- Use Midscene actions/assertions for user interactions and checks.

## After writing a test

- Ensure the test follows Midscene-first conventions.
- Ensure no screenshot snapshots are introduced.
- Keep setup logic in routines and UI interactions in scenarios.

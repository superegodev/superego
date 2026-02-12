---
name: writing-browser-app-e2e-tests
description: Write a Playwright e2e test in the browser-app-e2e-tests package.
---

# Writing browser-app e2e tests

## When to use this skill

When you need to write a Playwright e2e test for browser-app package.

## Base instructions

- Directory: `packages/tests/browser-app-e2e-tests/src/scenarios`
- Test title: three-digit identifier + dot + short description of the test
- File name: three-digit sequential identifier + `-` +
  snake-cased-short-description + `.test.ts`

For assertions, **ONLY** use visual comparisons of screenshots via
`VisualEvaluator.expectToSee`. **DO NOT** use other assertions.

## Test structure

Tests are structured as multi-step scenarios in which the simulated user tries
to reach a specific goal. Each test starts from the empty state of the
application, so the first steps of the scenarios should be about configuring and
creating everything needed for the later steps.

The Bazaar section of the app contains ready-made "packs" of collection
categories, collections, and apps, that can be installed to create a useful
starting point.

Technically, a test is a sequence of Playwright test steps. Each step has two
sections (visually separated by `// $SectionName` comments):

- Exercise: takes actions and waits for them to have effect.
- Verify: calls `VisualEvaluator.expectToSee` exactly once, which:
  - Takes a screenshot of either a specific element (preferred) or the whole
    page.
  - Describes the **current** state it expects to see in the screenshot. (No
    references to what happened before.)

Additional requirements:

- Step title: two-digit-index + dot + title. Example `00. Go to Homepage`.
- Steps must be ordered correctly. I.e., `00. $title` must go before
  `01. $otherTitle`.
- Snapshot names must match the step index. Example: `00.png` for step
  `00. $title`.

## Run test and evaluate screenshots

Run the test with
`yarn workspace @superego/browser-app-e2e-tests test:playwright`.

When the test runs the first time there are no "golden reference snapshots" yet,
so the test will fail.

However, the run generates the yet-to-be-evaluated snapshots in the
`packages/tests/browser-app-e2e-tests/src/scenarios/$TEST_FILE_NAME-snapshots`
directory.

One by one, visually review the snapshots and ensure they match the
corresponding described expectation.

## Reusable test logic

Reusable test logic is shared code that makes scenarios simpler and more
reliable by extracting common selectors and interactions into locators, actions,
and routines.

When writing a new locator, action, or routine:

- Check existing ones and follow the same style and patterns.
- Follow the specific guidelines written below.

### Locators

The `packages/tests/browser-app-e2e-tests/src/locators` directory contains
reusable locator builders.

Guidelines:

- Locators must **not** contain steps, assertions, or waits.
- Return `Locator`s (or small grouped locator objects) and scope within
  containers when possible.
- Name by intent + target (e.g., `bazaarPackCard`, `installPackButton`).

### Actions

The `packages/tests/browser-app-e2e-tests/src/actions` directory contains
reusable functions that each perform a small single action shared across
multiple tests.

Guidelines:

- Actions must **not** contain steps.
- Do one thing: a single user interaction (click, type, select, etc.).
- Be specific and UI-focused: name the exact intent + target (e.g.,
  `clickInstallPackButton`), not generic helpers.
- Include only the minimal waits/guards needed to make the action reliable
  (e.g., ensure the element is visible/enabled before interacting).
- Do not chain multiple actions; if you need a sequence, create a routine.

### Routines

The `packages/tests/browser-app-e2e-tests/src/routines` directory contains
reusable functions that compose multiple actions into a single higher-level
interaction. A routine performs a specific goal (e.g., "installing a pack",
"filling-in a form") by calling actions in sequence and handling any expected
intermediate UI transitions (waiting for navigation, toasts, modals, etc.).
Check existing routines for examples.

Guidelines:

- Routines can contain actions, but must **not** contain steps.
- Keep routines goal-oriented and deterministic: given the same starting state,
  they should do the same thing.
- Prefer a small, stable API: accept explicit inputs and avoid hidden defaults.
- Use assertions/validation only if the routine needs a minimal guard to ensure
  it can proceed (e.g., wait for a page to be ready).
- Avoid branching logic when possible; if you need variants, create separate
  routines.

## After writing a test

After writing a test, check other tests and see if there are duplicated
locators, actions, or routines. If there are, suggest a refactor to the user.

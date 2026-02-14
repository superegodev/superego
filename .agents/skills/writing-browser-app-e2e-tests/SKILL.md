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

For assertions, **ONLY** use `aiAssert` from the Midscene fixture. **DO NOT**
use screenshot comparisons, `expect`, or other assertion methods.

For user interactions, **ONLY** use Midscene AI methods (`aiTap`, `aiInput`,
`ai`, `aiWaitFor`, etc.). **DO NOT** use Playwright locators (`getByRole`,
`getByTestId`, `locator`, etc.) or custom action functions.

## Test structure

Tests are structured as multi-step scenarios in which the simulated user tries
to reach a specific goal. Each test starts from the empty state of the
application.

Use the `createCollection` and `createContact` routines for programmatic setup
(creating collections and documents via the backend API) so that tests can focus
on the UI flow being tested.

Import `test` from the Midscene fixture file, **not** from `@playwright/test`:

```typescript
import { test } from "../fixture.js";
```

Destructure the Midscene helpers you need from the test callback:

```typescript
test("NNN. Title", async ({
  page,
  ai,
  aiTap,
  aiInput,
  aiAssert,
  aiWaitFor,
}) => {
  // ...
});
```

A test is a sequence of Playwright test steps. Each step has two sections
(visually separated by `// $SectionName` comments):

- Exercise: uses Midscene AI actions (`aiTap`, `aiInput`, `ai`, `aiWaitFor`)
  and `page.goto`/`page.reload` for navigation.
- Verify: calls `aiAssert` with a natural language description of the
  **current** expected state. (No references to what happened before.)

Additional requirements:

- Step title: two-digit-index + dot + title. Example `00. Go to Homepage`.
- Steps must be ordered correctly. I.e., `00. $title` must go before
  `01. $otherTitle`.

## Midscene AI methods reference

- `aiTap(target)` — click on an element described in natural language.
- `aiInput(text, target, options?)` — type text into a field described in
  natural language. Use `{ mode: "replace" }` to clear the field first.
- `aiAssert(assertion)` — assert a condition described in natural language.
  Throws if the assertion fails.
- `aiWaitFor(condition, options?)` — wait until a condition described in natural
  language is met. Accepts `{ timeoutMs }`.
- `ai(instruction)` — perform a general AI-driven action described in natural
  language (e.g., selecting text, keyboard shortcuts, drag-and-drop).
- `aiQuery(query)` — extract structured data from the page.
- `aiScroll(options, target?)` — scroll within a target element.

## Run test

Run the test with
`yarn workspace @superego/browser-app-e2e-tests test:playwright`.

After the run, Midscene generates a report at
`midscene_run/report/<id>.html`.

## Reusable test logic

### Routines

The `packages/tests/browser-app-e2e-tests/src/routines` directory contains
reusable functions for programmatic test setup.

Available routines:

- `createCollection(page, definition)` — programmatically creates a collection
  via the in-browser backend API. Returns the collection ID. Does not navigate.
- `createContact(page, collectionId, contact)` — programmatically creates a
  document in a Contacts collection via the in-browser backend API. Returns the
  document ID. Does not navigate.

These routines use `page.evaluate` to call the backend API directly. They do not
perform any UI interactions. After calling them, navigate to the created
resource using `page.goto`.

Guidelines for new routines:

- Routines must be **programmatic only**: use `page.evaluate` to call backend
  APIs. Do not use UI interactions, locators, or Midscene AI methods.
- Keep routines goal-oriented and deterministic.
- Prefer a small, stable API: accept explicit inputs and avoid hidden defaults.
- Return the created resource's ID so tests can navigate to it.

## After writing a test

After writing a test, check other tests and see if there are duplicated
routines. If there are, suggest a refactor to the user.

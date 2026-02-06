## Repo overview

- This is a Yarn (Berry) workspaces monorepo; code lives under `packages/` with
  domain groupings like `apps/`, `core/`, `ui/`, `data/`, and `tests/`.

## Tooling & conventions

- **Package manager:** Yarn (Berry) via Corepack. PnP is **not** used.
- **Node version:** >= 24.
- Follow existing patterns in the package you are editing; keep changes focused
  and consistent with surrounding code.

## Testing

- What to test and how:
  - For focused utilities -> add unit tests.
  - For frontend components -> don't add tests at all.
  - For usecases -> add e2e tests to the relevant suite in
    `packages/tests/backend-e2e-tests/src/suites`.
  - For data repositories -> add unit tests to the relevant suite in
    `packages/core/executing-backend/src/requirements/data-repositories-tests/suites`.
- Follow the existing patterns and styling conventions when writing tests. In
  particular, always use comments `// Setup mocks` (optional), `// Setup SUT`
  (optional), `// Exercise`, and `// Verify` to visually separate the "phases"
  of a test.

## NPM scripts

### Global

- `yarn install`
- `yarn test`: runs tests for **all** packages
- `yarn fix-formatting`
- `yarn fix-linting`
- `yarn check-linting`
- `yarn check-types`: checks that **all packages** compile correctly
- `yarn check-translations`: checks translations are up-to-date and complete

### Workspace-specific

Run with `yarn workspace <package-name> run <script-name>`. Available scripts:

- `check-types`: checks that a specific package compiles correctly
- `test`: runs tests for a specific package (note: **not** all packages define
  it)

## Frontend-specific instructions

- When you change frontend files in `packages/apps/browser-app`, always run
  `yarn workspace @superego/browser-app translations:extract-and-compile` and
  update `packages/apps/browser-app/src/translations/it.json` accordingly.

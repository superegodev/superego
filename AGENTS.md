## Repo overview

- This is a Yarn (Berry) workspaces monorepo; code lives under `packages/` with
  domain groupings like `apps/`, `core/`, `ui/`, `data/`, and `tests/`.

## Tooling & conventions

- **Package manager:** Yarn (Berry) via Corepack. PnP is **not** used.
- **Node version:** >= 24.
- Follow existing patterns in the package you are editing; keep changes focused
  and consistent with surrounding code.

## Testing

What to test and how:

- For focused utilities -> add unit tests.
- For frontend components -> don't add tests at all.
- For usecases -> add e2e tests to the relevant suite in
  `packages/tests/backend-e2e-tests/src/suites`.
- For data repositories -> add unit tests to the relevant suite in
  `packages/core/executing-backend/src/requirements/data-repositories-tests/suites`.

Do **not** add other types of tests.

Follow the existing patterns and styling conventions when writing tests. In
particular, always use comments `// Setup mocks` (optional), `// Setup SUT`
(optional), `// Exercise`, and `// Verify` to visually separate the "phases" of
a test.

## NPM scripts

### Global

- `yarn install`
- `yarn test`: runs tests for **all** packages
- `yarn fix-formatting`
- `yarn fix-linting`
- `yarn check-linting`
- `yarn check-types`: checks that **all packages** compile correctly
- `yarn check-translations`: checks translations are up-to-date and complete

Always run the checks before committing. They **should** pass, but if some fails
and it's not trivial to fix, you can leave it failing and commit anyways.

### Workspace-specific

Run with `yarn workspace <package-name> run <script-name>`. Available scripts:

- `check-types`: checks that a specific package compiles correctly
- `test`: runs tests for a specific package (note: **not** all packages define
  it)

## Frontend-specific instructions

- When you change frontend files in `packages/apps/browser-app`, always run
  `yarn workspace @superego/browser-app translations:extract-and-compile` and
  update `packages/apps/browser-app/src/translations/it.json` accordingly.
- **CSS-in-TS convention:** Each component folder has at most **one** `.css.ts`
  file, named after the folder (e.g. `CollectionPreviewsTabs.css.ts`). When a
  folder contains multiple components, the single `.css.ts` file exports one
  `export const ComponentName` object per component (e.g.
  `export const CollectionPreviewsTabs = { … }` and
  `export const CollectionPreview = { … }`). Do **not** create additional
  `.css.ts` files for sub-components in the same folder.

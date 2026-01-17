## Repo overview

- This is a Yarn (Berry) workspaces monorepo; code lives under `packages/` with
  domain groupings like `apps/`, `core/`, `ui/`, `data/`, and `tests/`.

## Tooling & conventions

- **Package manager:** Yarn (Berry) via Corepack. PnP is **not** used.
- **Node version:** >= 24.
- Follow existing patterns in the package you are editing; keep changes focused
  and consistent with surrounding code.

## NPM scripts

### Global

- `yarn install`
- `yarn test`
- `yarn check-linting`
- `yarn check-types`: checks TypeScript compiles correctly
- `yarn check-translations`: checks translations are up-to-date and complete

### Workspace-specific

Run with `yarn workspace <package-name> run <script-name>`. Available scripts:

- `check-types` (all packages define it)
- `test` (**not** all packages define it)

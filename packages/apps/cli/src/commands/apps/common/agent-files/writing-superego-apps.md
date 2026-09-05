---
name: writing-superego-apps
description:
  Use when writing Superego collection-view apps in generated app project
  checkouts.
---

# Writing Superego Apps

Superego apps are single-entrypoint collection-view apps.

Project lifecycle:

- Use `superego apps init --args <file>` only for a brand-new app that does not
  yet exist in Superego. It creates a local app project without `app.lock.json`.
- `app.lock.json` appears after `superego apps commit` creates the backend app.
- Use `superego apps checkout --args <file>` to edit an existing app from the
  database. It creates a locked checkout with `app.lock.json`.
- `app.lock.json` records the app id, app version, and target collection
  versions that this checkout was based on. Treat it as generated state, not
  editable source.

Project files:

- Edit `app.json` for name and target collections.
- Edit `main.tsx` for UI. It must default-export a function component.
- Import generated `Collection_*.ts` types from `main.tsx` for type safety.
- Treat `Collection_*.ts`, `node_modules/**`, `tsconfig.json`, `AGENTS.md`, and
  `.agents/**` as generated.

Runtime imports:

- Use `@superego/app-sandbox/components` for UI components. Read
  `node_modules/@superego/app-sandbox/components/index.d.ts` for available
  exports and props.
- Use `@superego/app-sandbox/hooks` for document hooks. Read
  `node_modules/@superego/app-sandbox/hooks/index.d.ts` for signatures.
- Use `@superego/app-sandbox/theme` for theme tokens. Read
  `node_modules/@superego/app-sandbox/theme/index.d.ts` for available tokens.
- Use `react` for React APIs.
- Use `echarts/*` types with the Echart component.

Commands:

- `superego apps check`: validate and compile.
- `superego apps status`: compare local durable files with the database.
- `superego apps diff`: show local changes compared with the database.
- `superego apps add-collection Collection_...`: add a target collection and
  regenerate types.
- `superego apps remove-collection Collection_...`: remove a target collection
  and regenerate types.
- `superego apps commit`: create/update the backend app.

Recovering stale checkouts:

- If `superego apps status` reports `checkout stale`, the backend app changed
  after this project was checked out.
- Do not edit `app.lock.json` to force a commit. Use it only as generated state
  once present.
- Preserve local edits to `app.json` and `main.tsx`, then refresh from the
  database with `superego apps checkout --args <file>` using an args file that
  contains `path` and `appId`, or re-checkout after saving your local changes
  elsewhere.
- Reapply the local edits to the refreshed checkout, run `superego apps check`,
  then `superego apps commit`.

## App specifications

App projects include `spec.md`, the current Markdown description of the app's
requirements, expected behavior, constraints, and rationale. Read it before
editing and update it alongside behavior changes. For a new app, initialize it
from the user's request. Keep it as a current specification, not a changelog.

`superego apps checkout` retrieves the stored spec. `apps status` and
`apps diff` include spec changes, and `apps commit` saves them even when code is
unchanged. An absent `spec.md` in an older checkout preserves the stored spec;
an empty file clears it. Specs are versioned together with the implementation.

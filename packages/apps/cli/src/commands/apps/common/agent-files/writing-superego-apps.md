# Writing Superego Apps

Superego apps are single-entrypoint collection-view apps.

Project lifecycle:

- Use `superego apps init <path>` only for a brand-new app that does not yet
  exist in Superego.
- Use `superego apps checkout <path> <appId>` to edit an existing app from the
  database.
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
  `node_modules/@superego/app-sandbox/components.d.ts` for available exports and
  props.
- Use `@superego/app-sandbox/hooks` for document hooks. Read
  `node_modules/@superego/app-sandbox/hooks.d.ts` for signatures.
- Use `@superego/app-sandbox/theme` for theme tokens. Read
  `node_modules/@superego/app-sandbox/theme.d.ts` for available tokens.
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
- Do not edit `app.lock.json` to force a commit.
- Preserve local edits to `app.json` and `main.tsx`, then refresh from the
  database with `superego apps checkout <new-path> <appId>` or re-checkout after
  saving your local changes elsewhere.
- Reapply the local edits to the refreshed checkout, run `superego apps check`,
  then `superego apps commit`.

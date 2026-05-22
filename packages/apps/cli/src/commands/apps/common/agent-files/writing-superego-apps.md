# Writing Superego Apps

Superego apps are single-entrypoint collection-view apps.

Project files:

- Edit `app.json` for name and target collections.
- Edit `main.tsx` for UI.
- Treat `Collection_*.ts`, `node_modules/**`, `tsconfig.json`, `AGENTS.md`, and
  `.agents/**` as generated.

Commands:

- `superego apps check`: validate and compile.
- `superego apps status`: compare local durable files with the database.
- `superego apps add-collection Collection_...`: add a target collection and
  regenerate types.
- `superego apps remove-collection Collection_...`: remove a target collection
  and regenerate types.
- `superego apps commit`: create/update the backend app.

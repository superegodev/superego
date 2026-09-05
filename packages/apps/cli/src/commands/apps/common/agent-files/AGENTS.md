# Superego App Project

Durable files:

- `app.json`: editable app manifest.
- `main.tsx`: app source committed to Superego.
- `spec.md`: current Markdown specification, committed with the app
  implementation.

Generated files:

- `app.lock.json`, `Collection_*.ts`, `AGENTS.md`, `.agents/**`,
  `node_modules/**`, `tsconfig.json`.

Rules:

- Read `spec.md` before editing. Initialize it from the user request for a new
  app.
- Update `spec.md` when requirements, behavior, constraints, or rationale
  change. Preserve still-relevant requirements; keep a current specification,
  not a changelog.
- Do not edit generated files directly.
- Use `superego apps check` before committing.
- Use `superego apps commit` to write durable changes to Superego.
- Runtime imports may use `react`, `@superego/app-sandbox/components`,
  `@superego/app-sandbox/hooks`, `@superego/app-sandbox/theme`, and `echarts/*`.
- Only `main.tsx` is committed as app source.

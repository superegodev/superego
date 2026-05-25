# Superego App Project

Durable files:

- `app.json`: editable app manifest.
- `main.tsx`: app source committed to Superego.

Generated files:

- `app.lock.json`, `Collection_*.ts`, `AGENTS.md`, `.agents/**`,
  `node_modules/**`, `tsconfig.json`.

Rules:

- Do not edit generated files directly.
- Use `superego apps check` before committing.
- Use `superego apps commit` to write durable changes to Superego.
- Runtime imports may use `react`, `@superego/app-sandbox/components`,
  `@superego/app-sandbox/hooks`, `@superego/app-sandbox/theme`, and `echarts/*`.
- Only `main.tsx` is committed as app source.

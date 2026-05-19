export const appAgentsContent = `# Superego App Project

Durable files:

- \`app.json\`: editable app manifest.
- \`main.tsx\`: app source committed to Superego.

Generated files:

- \`app.lock.json\`, \`Collection_*.ts\`, \`AGENTS.md\`, \`.agents/**\`, \`node_modules/**\`, \`tsconfig.json\`.

Rules:

- Do not edit generated files directly.
- Use \`superego apps check\` before committing.
- Use \`superego apps commit\` to write durable changes to Superego.
- Runtime imports may use \`react\`, \`@superego/app-sandbox/components\`, \`@superego/app-sandbox/hooks\`, and \`@superego/app-sandbox/theme\`.
- Only \`main.tsx\` is committed as app source.
`;

export const appSkillContent = `# Writing Superego Apps

Superego apps are single-entrypoint collection-view apps.

Project files:

- Edit \`app.json\` for name and target collections.
- Edit \`main.tsx\` for UI.
- Treat \`Collection_*.ts\`, \`node_modules/**\`, \`tsconfig.json\`, \`AGENTS.md\`, and \`.agents/**\` as generated.

Commands:

- \`superego apps check\`: validate and compile.
- \`superego apps status\`: compare local durable files with the database.
- \`superego apps add-collection Collection_...\`: add a target collection and regenerate types.
- \`superego apps remove-collection Collection_...\`: remove a target collection and regenerate types.
- \`superego apps commit\`: create/update the backend app.
`;

# CLI Agent Evals

Opt-in Vitest evals for checking whether a coding agent can use the Superego CLI
safely and effectively.

## Run

Build the CLI binary:

```sh
yarn workspace @superego/electron-app build:cli
```

Run the evals with an agent command:

```sh
SUPEREGO_CLI_AGENT_COMMAND='your-agent-command --prompt-file {promptFile}' \
  yarn workspace @superego/cli-agent-evals test:e2e
```

If the command template contains `{promptFile}`, the harness replaces it with a
temporary prompt file path. If it contains `{prompt}`, the harness replaces it
with the prompt text. The prompt is also written to stdin.

## Safety

Each eval creates a temporary SQLite database and exposes a guarded `superego`
wrapper at the front of `PATH`. The wrapper refuses to run unless
`SUPEREGO_DATABASE_FILE` points inside that eval's temp database directory.

Set `SUPEREGO_CLI_BIN` to use a CLI binary other than
`packages/apps/electron-app/dist/cli/superego.js`.

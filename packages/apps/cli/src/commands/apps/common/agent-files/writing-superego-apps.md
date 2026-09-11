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

- Edit `app.json` for name, target collections, permissions, and state
  source-file paths.
- Edit `state.schema.json`, `state.initial.json`, and optional
  `state.migration.ts` for persistent state.
- Edit `main.tsx` for UI. It must default-export a function component.
- Import generated `Collection_*.ts` types from `main.tsx` for type safety.
- Treat `app-state.ts`, `Collection_*.ts`, `node_modules/**`, `tsconfig.json`,
  `AGENTS.md`, and `.agents/**` as generated.

Runtime imports:

- Use `@superego/app-sandbox/components` for UI components. Read
  `node_modules/@superego/app-sandbox/components/index.d.ts` for available
  exports and props.
- Use `@superego/app-sandbox/hooks` for document and app-state hooks. Read
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
- Preserve local edits to `app.json`, `main.tsx`, and state source files, then
  refresh from the database with `superego apps checkout --args <file>` using an
  args file that contains `path` and `appId`, or re-checkout after saving your
  local changes elsewhere.
- Reapply the local edits to the refreshed checkout, run `superego apps check`,
  then `superego apps commit`.

## Permissions

Permissions are app configuration, independent of code versions. Declare all
permission fields in `app.json` and commit to apply them. A permissions-only
commit updates the app without compiling code or creating a version.

The manifest is authoritative when committing: check `apps diff` first if
permissions may have been changed in the app since checkout.

For example:

```json
{
  "permissions": {
    "modals": true,
    "downloads": false,
    "http": {
      "allowedOrigins": ["https://api.example.com", "http://127.0.0.1:8080"]
    }
  },
  "stateDefinition": {
    "schema": "state.schema.json",
    "initialState": "state.initial.json",
    "migration": null
  }
}
```

`modals` enables browser dialogs and printing; `downloads` enables file
downloads. HTTP entries must be HTTP(S) origins without credentials, paths,
queries, or wildcards. A URL stored in app state does not grant permission to
connect to it. Reload the app to pick up permission changes made elsewhere.

Use native `fetch()` for allowed services. Redirect destinations must also be
allowed. Supply any service credentials yourself, check `response.ok`, and
handle network errors. For example:

```tsx
async function loadItems() {
  const response = await fetch("https://api.example.com/items", {
    headers: { Authorization: "Bearer app-supplied-token" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}
```

In the browser and demo, ordinary CORS rules apply: configure the service to
allow the sandbox origin or use a CORS browser extension. The desktop app
relaxes CORS for app requests, but services must still respond to any OPTIONS
preflight. Both runtimes retain browser restrictions on cookies, TLS, mixed
content, and local-network access.

## Persistent app state

Every app must declare `stateDefinition`. The schema uses the same format as
collection schemas, but cannot contain `File` or `DocumentRef` types. Initial
content must match the schema. For an app without stored content, use `{}` and a
Struct schema with no properties. The `migration` field is required; use `null`
unless applying a migration.

`apps init` creates the state files. `apps check` validates them and compiles
any migration. Import the schema's root type from the generated `app-state.ts`;
the example below assumes the schema's `rootType` is `State`:

```tsx
import { useAppState, useUpdateAppState } from "@superego/app-sandbox/hooks";
import type { State } from "./app-state.js";

// Inside your component:
const state = useAppState<State>();
const updateState = useUpdateAppState<State>();

function save(nextState: State) {
  if (!state.data || updateState.isPending) {
    return;
  }
  updateState.mutate({
    latestRevision: state.data.revision,
    content: nextState,
  });
}
```

`useAppState` returns `data`, `isLoading`, `error`, and `refetch()`; `data`
contains `content` and `revision`. Show loading and error states before using
the content. Updates replace the entire content and must match the schema.

`useUpdateAppState` returns `mutate`, `isIdle`, `isPending`, `isError`,
`isSuccess`, `error`, and `data` (always `null`), like the document mutation
hooks. Call `mutate` to start an update, use `isPending` to disable saving while
it runs, and handle failures through `error`. Read the saved content from
`useAppState`. Handle rejected `refetch()` calls with `try/catch`.

Common state errors:

- `AppStateRevisionNotMatching`: another instance changed the state. Refetch,
  reconcile the user's changes with the latest content, and retry.
- `AppStateContentNotValid`: correct the content using the validation issues.
- `AppVersionIdNotMatching`: reload the app to use the current version.

State is shared by all instances of an app and survives reopening and code
updates. Successful writes refresh the current instance's state; other open
instances need to reload or call `refetch()`. Initial content is used only when
the app is created. Editing it does not reset saved state. Checkouts and exports
include the state definition, not saved content.

## State migrations

When saved content would not match a new schema, create `state.migration.ts` and
set `stateDefinition.migration` to its filename. You can also use a migration to
transform content without changing the schema. Default-export a synchronous
function that accepts the previous content and returns content matching the new
schema. Migrations cannot use networking or app hooks. For example, when adding
a required `theme` field:

```ts
import type { State } from "./app-state.js";

type PreviousState = Omit<State, "theme">;

export default function migrate(previousContent: PreviousState): State {
  return { ...previousContent, theme: "light" };
}
```

Run `apps check` before committing. `AppStateMigrationRequired` means saved
content needs a migration. `AppStateMigrationNotValid` or
`AppStateMigrationFailed` means the migration must be corrected; inspect the
reported diagnostics or validation issues. For later code-only updates, set
`migration` back to `null` so the earlier migration is not replayed. To stop
storing content, migrate to `{}` and an empty Struct schema.

# Superego CLI Spec

Basic command:

```sh
superego $domain $command
```

## Available domains / commands

```sh
collection-categories
  create
  update
  delete
  list

collections
  create
  create-many
  update-settings
  create-new-version
  update-latest-version-settings
  delete
  list
  get-typescript-schema

documents
  create
  create-many
  create-new-version
  delete
  list
  list-versions
  get
  get-version
  search
  execute-typescript-function

files
  get-content

agents
  install-skill

apps
  init
  checkout
  check
  status
  commit
  add-collection
  remove-collection
  delete
  list
```

Most of the commands are just "proxies" to the corresponding backend usecases.
Exceptions are listed below.

## General behavior

The CLI does not require the Superego Electron app to be running. It
instantiates `ExecutingBackend`, connects to the default local database, and
executes backend usecases directly.

The CLI is primarily for coding agents. Optimize command output and generated
project files for LLM consumption.

Commands should print JSON to stdout.

Proxy commands should print the backend usecase `Result` object as JSON. Local
workflow commands should use the same basic shape:

- `{ "success": true, "data": ... }`
- `{ "success": false, "error": ... }`

Commands should exit with code `0` for successful results and non-zero for
unsuccessful results.

Every command must support `--help`. Help mode does not execute the command.
It prints Markdown to stdout, without a JSON wrapper.

Help output is LLM-first:

- concise
- token-efficient
- no fluff
- no prose paragraphs
- command syntax
- arguments/options
- JSON output shape
- side effects
- common failure cases
- related commands

The app workflow uses the existing single-file app model:

- Apps are single-entrypoint collection-view apps.
- The editable source is `main.tsx` in the project root.
- Compilation is an implementation detail of `apps check` and `apps commit`.

## Exceptions

### `collections get-typescript-schema` and `documents execute-typescript-function`

There are no corresponding usecases, but there are tools for the integrated
assistant that do the same two things. These commands should **not** share code
with those tools, but they should implement the same functionality (copy/paste
the code, basically).

### `agents install-skill`

Installs a Superego CLI skill for a coding agent.

```sh
superego agents install-skill --agent $agent
superego agents install-skill --directory $skillsDirectory
```

Arguments:

- `--agent claude|codex|copilot|cursor|gemini|windsurf|kiro|opencode`
- `--directory $skillsDirectory`

Behavior:

- Installs the Superego CLI Agent Skills package.
- `--agent` selects a known user-global Agent Skills directory.
- `--directory` installs into an explicit Agent Skills directory.
- Exactly one of `--agent` or `--directory` is required.
- Writes `<skillsDirectory>/superego-cli/SKILL.md`.
- The installed skill contains generic Superego CLI guidance.
- The skill teaches the agent to use `superego $domain $command --help` as the
  authoritative command documentation.
- The skill is concise and token-efficient.

Skill content:

- Superego CLI is for coding agents.
- Commands output JSON unless invoked with `--help`.
- Proxy commands output backend `Result` JSON.
- Local workflow commands output `{ success, data }` or `{ success, error }`.
- Use `--help` before unfamiliar commands.
- Prefer CLI commands over direct database edits.
- Command map by domain.
- Common workflows:
  - inspect available commands
  - create/list/update backend objects
  - initialize/check/commit app projects

Known agent directories:

- `claude`: `~/.claude/skills/`
- `codex`: `~/.codex/skills/`
- `copilot`: `~/.copilot/skills/`
- `cursor`: `~/.cursor/skills/`
- `gemini`: `~/.gemini/skills/`
- `windsurf`: `~/.codeium/windsurf/skills/`
- `kiro`: `~/.kiro/skills/`
- `opencode`: `~/.config/opencode/skills/`

## App Project Format

An app project is a local directory with this shape:

```text
app.json
app.lock.json
main.tsx
Collection_*.ts
AGENTS.md
.agents/
  skills/
    writing-superego-apps/
      SKILL.md
node_modules/
  react/
    global.d.ts
    index.d.ts
    jsx-runtime.d.ts
  echarts/
    ...
  @superego/
    app-sandbox/
      components/index.d.ts
      hooks/index.d.ts
      theme/index.d.ts
tsconfig.json
```

### Durable files

`app.json` and `main.tsx` are the durable user-authored files.

`app.json` is the editable app manifest. It contains only fields the user or
agent is expected to edit.

`main.tsx` is the source that is stored in the database as
`latestVersion.files["/main.tsx"].source`.

### Generated files

`app.lock.json`, `Collection_*.ts`, `AGENTS.md`, `.agents/**`,
`node_modules/**`, and `tsconfig.json` are generated files.

`app.lock.json` records the database objects that the local checkout currently
corresponds to. The CLI owns this file.

`Collection_*.ts` files contain collection schema TypeScript files generated
with the same schema codegen used by the in-app editor. The in-app editor
exposes each target collection as a virtual TypeScript lib at
`/${collection.id}.ts`, so the checkout mirrors that layout by writing generated
collection files next to `main.tsx`.

`node_modules/**` contains generated TypeScript declaration files copied from
the same app-sandbox TypeScript libs used by the in-app editor.

`AGENTS.md` and `.agents/**` contain coding-agent instructions for the app
project. They document the local file layout, app API, generated files, command
workflow, and Superego app constraints. They should be concise, token-efficient,
and written for coding agents.

`tsconfig.json` is generated so editors understand JSX, the generated type
files, and the app runtime stubs. It is static for an app project and does not
depend on the target collection list.

### `app.json`

`app.json` has this shape:

```json
{
  "name": "My App",
  "type": "CollectionView",
  "targetCollectionIds": ["Collection_..."]
}
```

Field rules:

- `name` is the backend app name.
- `type` is currently always `"CollectionView"`.
- `targetCollectionIds` is the ordered list of collections the app targets. May
  be empty.

### `app.lock.json`

`app.lock.json` has this shape:

```json
{
  "appId": "App_...",
  "latestAppVersionId": "AppVersion_...",
  "targetCollections": [
    {
      "id": "Collection_...",
      "versionId": "CollectionVersion_..."
    }
  ]
}
```

Field rules:

- `appId` is the checked-out or last-committed backend app id.
- `latestAppVersionId` is the app version id that was latest immediately after
  checkout or the last successful commit from this folder.
- `targetCollections` records the exact collection versions that were written
  into the app version represented by `latestAppVersionId`.

For a new uncommitted app, `app.lock.json` may be absent. After the first
successful commit, the CLI writes it.

### `main.tsx`

`main.tsx` exports the app component as its default export.

The generated scaffold should follow the same import style as the in-app editor:

```ts
import React from "react";
import { DefaultApp } from "@superego/app-sandbox/components";
import type * as Collection_0 from "./Collection_0.js";

interface Props {
  collections: {
    Collection_0: {
      id: "Collection_0";
      versionId: string;
      displayName: string;
      documents: {
        id: string;
        versionId: string;
        href: string;
        content: Collection_0.Root;
      }[];
    };
  };
}

export default function App(props: Props): React.ReactElement | null {
  return <DefaultApp {...props} />;
}
```

When there are no target collections, the scaffold should use:

```ts
interface Props {
  collections: Record<string, never>;
}
```

Runtime imports should continue to use the sandbox module names:

- `react`
- `@superego/app-sandbox/components`
- `@superego/app-sandbox/hooks`
- `@superego/app-sandbox/theme`

The sandbox provides these modules at render time. The generated
`node_modules/**` files are local declaration files for editor/compiler support.

The compiler must continue to support existing imports from
`@superego/app-sandbox/components`, `@superego/app-sandbox/hooks`, and
`@superego/app-sandbox/theme`.

### `Collection_*.ts`

For every target collection, generate a schema TypeScript file using the same
schema codegen used by the in-app editor.

The file name is the exact collection id with `.ts` appended.

## App Commands

### `apps init $path`

Creates a local folder with scaffold files to create a new app:

```text
app.json
main.tsx
Collection_*.ts
AGENTS.md
.agents/
  skills/
    writing-superego-apps/
      SKILL.md
node_modules/
  ...generated declaration files
tsconfig.json
```

Initial behavior:

- Create `$path`; fail if it already exists and is not empty.
- Write `app.json`.
- Do not write `app.lock.json`, because no database app exists yet.
- Use `"Untitled App"` as the default name unless a `--name` option is provided.
- Use an empty `targetCollectionIds` array unless one or more
  `--collection Collection_...` options are provided.
- For every provided collection id, load the collection from the backend,
  resolve its latest version, and generate its schema type file.
- Generate `main.tsx` with a minimal default component.
- Generate `Collection_*.ts`, `AGENTS.md`, `.agents/**`, `node_modules/**`, and
  `tsconfig.json`.

If no collections are configured, the generated `Props["collections"]` type
should be empty. The app can still be committed, but it will not receive any
documents until collections are added.

### `apps checkout $path $appId`

Creates a local folder with files from an existing app:

```text
app.json
app.lock.json
main.tsx
Collection_*.ts
AGENTS.md
.agents/
  skills/
    writing-superego-apps/
      SKILL.md
node_modules/
  ...generated declaration files
tsconfig.json
```

Checkout behavior:

- Fail if `$path` already exists and is not empty.
- Load the app via `apps.list()` and find `$appId` in the returned list.
- Use the app's latest version.
- Write `app.json` with:
  - `name` set to the app name.
  - `type` set to the app type.
  - `targetCollectionIds` set to the latest version's target collection ids.
- Write `app.lock.json` with the app id, latest app version id, and exact target
  collection id/version pairs.
- Write `main.tsx` from `latestVersion.files["/main.tsx"].source`.
- Generate `Collection_*.ts` from the target collection versions in
  `app.lock.json`.
- Generate `AGENTS.md` and `.agents/**`.
- Generate `node_modules/**`.
- Generate `tsconfig.json`.

If a target collection no longer exists locally, checkout should fail with an
error identifying the missing collection.

### `apps check`

From within an app folder. Validates the local app project and attempts
compilation.

Check behavior:

- Read and validate `app.json`.
- Read and validate `app.lock.json` if it exists.
- Resolve target collections from `app.json.targetCollectionIds`.
- Compile `main.tsx` using the same TypeScript inputs as the in-app editor:
  `/main.tsx`, one `/${collection.id}.ts` lib per target collection, and the
  app-sandbox declaration libs. This should use existing internal machinery.
- Do not call backend app create/update usecases.

Check must fail if:

- `app.json` is missing or invalid.
- `main.tsx` is missing.
- A target collection is missing.
- TypeScript compilation fails.
- The compiler produces no JavaScript output.

### `apps status`

From within an app folder. Diffs the local folder state with what is in the
database.

Status compares:

- Metadata:
  - app name
  - target collection ids
- Source:
  - local `main.tsx`
  - database `latestVersion.files["/main.tsx"].source`
- Checkout state:
  - `app.lock.json.appId`
  - `app.lock.json.latestAppVersionId`
  - current database latest app version id

Status does not treat `Collection_*.ts`, `AGENTS.md`, `.agents/**`,
`node_modules/**`, or `tsconfig.json` as durable app changes. It may report that
generated files are stale, but stale generated files do not by themselves
require a commit.

Status results:

- `clean`: metadata and source match the current database latest version.
- `new app`: `app.lock.json` is absent; commit will create a new backend app.
- `metadata changed`: name or target collections differ.
- `source changed`: `main.tsx` differs from the latest committed source.
- `checkout stale`: `app.lock.json.latestAppVersionId` is not the current
  database latest app version id for the same app.

### `apps commit`

From within the folder. Either creates the app if there's no corresponding app
yet, or creates a new version. In general it commits all the changes that have
been made, so it's possible that there is no code change (=no new version) but
just a metadata change (e.g., name change).

If there are code changes, committing compiles `main.tsx` before calling the
backend.

Commit behavior:

- Read and validate `app.json`.
- Compile `main.tsx`.
- If `app.lock.json` is absent, call `apps.create` with:
  - `type`
  - `name`
  - `targetCollectionIds`
  - the `main.tsx` source and the compiled output required by the backend
- If `app.lock.json` exists:
  - Load the current latest app from `apps.list()`.
  - Fail if the app does not exist.
  - If `name` changed, call `apps.updateName`.
  - If source changed or target collections changed, call
    `apps.createNewVersion` with the local `main.tsx` source, compiled output,
    and current target collection ids.
  - If only generated files changed, do not call backend mutation usecases.
- After a successful backend mutation, rewrite `app.lock.json` from the returned
  app:
  - current app id
  - current latest app version id
  - normalized target collection id/version pairs
- Do not rewrite user-editable `app.json` except for formatting if needed.
- The result data should report which operations were performed:
  - created app
  - updated name
  - created new version
  - nothing to commit

Only `main.tsx` is committed as app source. These local project files are not
committed as app source:

- `app.json`
- `app.lock.json`
- `Collection_*.ts`
- `AGENTS.md`
- `.agents/**`
- `node_modules/**`
- `tsconfig.json`
- any files outside `main.tsx`

### `apps add-collection` and `apps remove-collection`

From within the folder. Adds or removes a collection. This means:

- Updating `app.json` with the correct collection list.
- Updating the generated types.

Detailed behavior:

- `apps add-collection Collection_...`
  - Load the collection from the backend.
  - Resolve its latest collection version.
  - Fail if the collection is already present.
  - Append the id to `app.json.targetCollectionIds`.
  - Regenerate `Collection_*.ts`.
- `apps remove-collection Collection_...`
  - Fail if the collection is not present.
  - Remove it from `app.json.targetCollectionIds`.
  - Delete/regenerate generated type files so stale removed collection types are
    not left behind.

These commands do not commit by themselves. They only edit the local app
project. The changed target collection set is persisted on the next
`apps commit`.

### `apps list` and `apps delete`

These are backend proxy commands:

- `apps list` calls `backend.apps.list`.
- `apps delete $appId` calls `backend.apps.delete($appId, "delete")`.

Their JSON result data should include enough information to support the app
workflow:

- app id
- name
- latest app version id
- target collection ids
- target collection version ids

## App Compilation

Compilation should match the in-app editor compilation model:

- Read `main.tsx` as source.
- Compile `/main.tsx` with the same inputs used by the in-app editor.
- Provide generated collection schema types as TypeScript libs at
  `/${collection.id}.ts`.
- Provide app-sandbox, React, and other bundled declaration files from
  `@superego/app-sandbox/typescript-libs`.

The local source path and backend source file path are both `main.tsx`/
`/main.tsx`. The compiled output is passed to the backend create/version
usecases; it is not represented as a separate app project file.

Import path handling:

- New app scaffolds should use `./Collection_*.js` imports for collection types,
  matching the in-app editor's virtual `/${collection.id}.ts` layout.
- Existing app source that imports `@superego/app-sandbox/*` should keep
  working.
- Type-only imports from generated collection files should work the same way
  they do in the in-app editor: app source imports `./Collection_*.js`, while
  the compiler sees the corresponding generated lib at `/Collection_*.ts`.

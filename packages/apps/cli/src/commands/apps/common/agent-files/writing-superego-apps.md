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

## Versioned permissions and persistent app state

The user edits Permissions in the app editor or `app.json`, then saves or
commits a new app version. The supported configuration is:

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
    "migration": "state.migration.ts"
  }
}
```

Every app declares state. Use an empty object and a Struct schema with no
properties when the app does not need to store anything. The `migration` entry
is required; use `null` when no migration should run. `apps init` creates the
schema and initial-state files; `apps check` validates them and compiles
migration source. `apps checkout` writes those source files; `apps status`,
`diff` and `commit` include them. `app-state.ts` is generated from the state
schema and exports its root type. Saved content and revision are database data
and are never checked out or exported with the app. An app definition outside
the CLI embeds
`stateDefinition: { schema, initialState, migration: { source, compiled } | null }`
and the same permissions object.

All permission fields are required. Existing apps are migrated to restrictive
defaults. The modals capability permits printing, alert, confirm, prompt and
other browser modal dialogs; downloads enables file downloads. HTTP destinations
are normalized HTTP(S) origins without credentials, paths, queries or wildcards.
A service URL stored in app state does **not** authorize that service.

Use native `fetch()` inside the app, including at module initialization:

```tsx
import { useAppState, useUpdateAppState } from "@superego/app-sandbox/hooks";
import type { State } from "./app-state.js";

// Inside your component. Suppose State has a serviceUrl string property.
const state = useAppState<State>();
const updateState = useUpdateAppState<State>();

// State exposes data, isLoading, error and refetch().
// Handle async errors with try/catch and keep loading indicators in component state.
async function save(nextState: State) {
  if (!state.data) {
    return;
  }
  await updateState({
    latestRevision: state.data.revision,
    content: nextState,
  });
}
async function send() {
  if (!state.data) {
    return;
  }
  const response = await fetch(state.data.content.serviceUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      Authorization: "Bearer app-supplied-token",
    },
    body: "Any opaque service payload",
  });
  // fetch resolves for HTTP errors too. Check response.ok when appropriate.
  return {
    status: response.status,
    headers: response.headers,
    url: response.url,
    text: await response.text(),
  };
}
```

The host sends validated allowed origins in the existing `RenderApp` message.
Each iframe loads the same sandbox HTML and bootstrap in its own document. The
bootstrap appends a `Content-Security-Policy` meta element to `document.head`
before importing app code, so `connect-src` also applies to module
initialization. It installs the policy once per document. Removing or changing
the meta element cannot loosen the processed policy; additional policies can
only tighten it. Saving a new version remounts the iframe and installs the new
permissions.

The policy preserves sandbox resources (`'self'`, `data:`, `blob:` and
`https://tiles.openfreemap.org` for the built-in map), then adds the configured
origins. Native CSP source matching applies, including HTTP-to-HTTPS upgrades;
redirect destinations must also pass CSP. `connect-src` governs fetch, XHR and
other connection APIs, not all resource types such as images or navigation.
These permissions are not complete network isolation.

On Electron, the static sandbox CSP permits HTTP(S) connections so it does not
veto the per-document policy. `session.webRequest` adjusts CORS response headers
only for fetch/XHR requests attributed to a direct app iframe of the trusted
host document. Chromium enforces that iframe's CSP before issuing the request or
its OPTIONS preflight; no separate destination registry is needed. Host,
unrelated frame and unattributed requests retain normal CORS. Preflights receive
a successful status and the requested method and headers, including
Authorization. Actual HTTP response statuses and bodies remain unchanged. A
server still needs to answer OPTIONS: DNS, TLS and connection failures cannot be
fixed with headers. `webSecurity`, context isolation and renderer sandboxing
remain enabled.

Browser and demo runtimes retain ordinary fetch/CORS behavior. Configure the
service to allow the sandbox origin, or configure a CORS browser extension when
needed. Only response headers exposed by CORS are readable in browsers. An
extension that adjusts CORS does not grant a destination absent from CSP.

Fetch controls request bodies, response streaming/decoding, redirects, forbidden
headers and credentials in both runtimes. It defaults to same-origin
credentials; use `credentials: "include"` when a permitted service requires
cookies, subject to browser cookie rules. Superego adds no service credentials.
Use AbortController or `AbortSignal.timeout()` for deadlines. There is no
Superego body-size limit, DNS/IP pinning, private-address restriction or HTTP
backend transaction. TLS, mixed-content and local-network browser policies still
apply.

State is shared by all instances of an app and survives reopen and code updates.
Writes replace the full schema-valid object and require its revision. Conflicts
return `AppStateRevisionNotMatching`, including the latest and supplied
revisions; refetch and reconcile. No File or DocumentRef types are supported,
including nested/named definitions. Other schema types use the existing JSON
representation. Initial content is used only when the app is created and never
resets saved state. Existing apps without state are migrated to an empty object
and an empty Struct schema.

New app versions require the expected previous version ID. Compatible state is
preserved. If it is incompatible, supply a synchronous default-exported
migration `(previousContent) => nextContent`; explicit migrations also support
semantic changes with an unchanged schema. Migrations run in the existing
isolated JavaScript sandbox without networking or app-editing APIs. Version and
state commit together or roll back together. Schema changes and explicit
migrations advance the state revision. Every new-version call supplies
permissions and a state definition. Code-only versions use `migration: null` to
preserve saved state without replaying an earlier migration. Reads and writes
supply the loaded app version ID; `AppVersionIdNotMatching` rejects calls from
obsolete versions. Invalid content is `AppStateContentNotValid`, with validation
issues. App version creation reports `AppStateSchemaNotValid`,
`AppStateMigrationRequired`, `AppStateMigrationNotValid`, or
`AppStateMigrationFailed` as appropriate. Migration failures include a typed
cause with execution diagnostics or content validation issues. State definitions
cannot be null or absent. To stop storing content, migrate to an empty object
and its schema. Deleting the app deletes its state.

Permissions use the app version loaded by the host. Reload an app to pick up
changes made elsewhere. There are no HTTP sessions, instance tokens, lifecycle
monitors or polling.

State writes update the current iframe's cached state. Other open instances read
the latest saved state when they reload or explicitly call refetch().

Previews use separate ephemeral state initialized from the preview definition.
Migration trials run on preview initial content, never on saved content.
Previews keep baseline sandbox permissions and add no HTTP destinations. Test
printing, downloads and allowed destinations by running the saved app version.

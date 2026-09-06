# App capabilities and state

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
  "state": {
    "schema": "state.schema.json",
    "initialState": "state.initial.json",
    "migration": "state.migration.ts"
  }
}
```

The state declaration and its `migration` entry are optional. Create the named
source files when declaring state; `apps check` validates the schema and initial
state and compiles migration source. `apps checkout` writes those source files;
`apps status`, `diff` and `commit` include them. `app-state.ts` is generated
from the state schema and exports its root type. Saved content, revision and
schema identity are database data and are never checked out or exported with the
app. An app definition outside the CLI embeds
`state: { schema, initialState, migration?: { source, compiled } }` and the same
permissions object.

Missing permissions are restrictive. The modals capability permits printing,
alert, confirm, prompt and other browser modal dialogs; downloads enables file
downloads. HTTP destinations are normalized HTTP(S) origins without credentials,
paths, queries or wildcards. A service URL stored in app state does **not**
authorize that service.

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
    expectedRevision: state.data.revision,
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
representation. Initial content is used only when the app first acquires a state
schema and never resets saved state.

New app versions require the expected previous version ID. Compatible state is
preserved. If it is incompatible, supply a synchronous default-exported
migration `(previousContent) => nextContent`; explicit migrations also support
semantic changes with an unchanged schema. Migrations run in the existing
isolated JavaScript sandbox without networking or app-editing APIs. Version and
state commit together or roll back together. Schema transitions reject obsolete
contexts and advance the state revision and schema identity. Code-only versions
preserve schema identity and do not replay earlier migrations. State reads and
writes report `AppStateNotDefined`, `AppStateSchemaIdNotMatching`, or
`AppVersionIdNotMatching` when their context is unavailable or stale. Invalid
content is `AppStateContentNotValid`, with validation issues. App version
creation reports `AppStateSchemaNotValid`, `AppStateMigrationRequired`,
`AppStateMigrationNotValid`, or `AppStateMigrationFailed` as appropriate.
Migration failures include a typed cause with execution diagnostics or content
validation issues. Removing a state schema returns
`AppStateSchemaRemovalNotAllowed`; deleting the app deletes state.

Permissions use the app version loaded by the host. Reload an app to pick up
changes made elsewhere. There are no HTTP sessions, instance tokens, lifecycle
monitors or polling.

State writes update the current iframe's cached state. Other open instances read
the latest saved state when they reload or explicitly call refetch().

Previews use separate ephemeral state initialized from the preview definition.
Migration trials run on preview initial content, never on saved content.
Previews keep baseline sandbox permissions and add no HTTP destinations. Test
printing, downloads and allowed destinations by running the saved app version.

## Electron verification

Verified with the built shared sandbox on Electron 43.1.1 / Chromium
150.0.7871.114, with `webSecurity`, context isolation and sandboxing enabled:

- OPTIONS and PATCH both have the correct `details.frame` in
  `onBeforeSendHeaders` and `onHeadersReceived`. Frame identity remains stable
  across these callbacks, and the host request is attributed to the main frame.
- A 405 OPTIONS response is rewritten to 200 with the requested method and
  Authorization, Content-Type and custom headers. The subsequent fetch with
  credentials returns the original 500 status, body and readable service header.
- Two iframes loading the same HTML enforce different origin lists before app
  module initialization. Disallowed requests and redirect targets never reach
  the destination server.
- Changing/removing the meta elements and sending a later RenderApp cannot
  loosen a policy. A second policy tightens only its own document; recreating
  the iframe installs the new permissions. The app has no preload backend API.

The implementation uses Electron's documented
[WebRequest frame attribution and response-header/status interception](https://www.electronjs.org/docs/latest/api/web-request).

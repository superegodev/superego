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
alert, confirm, prompt and the other browser modal dialogs; downloads enables
file downloads. Destinations are exact normalized HTTP(S) origins. No wildcard,
subdomain, path or alternate-port permission is implied. On desktop, hostnames
authorize public resolved addresses only. For private or loopback services use
an explicit IP origin. A service URL stored in app state does **not** authorize
that service.

```tsx
import {
  useAppState,
  useUpdateAppState,
  useHttpRequest,
} from "@superego/app-sandbox/hooks";
import type { State } from "./app-state.js";

// Inside your component. Suppose State has a serviceUrl string property.
const state = useAppState<State>();
const updateState = useUpdateAppState<State>();
const request = useHttpRequest();

// Query: isLoading, isPending, isFetching, isError, error, data, refetch().
// Mutation: isIdle, isPending, isError, isSuccess, error, data, reset().
// Handle errors and conflicts explicitly in the component.
async function save(nextState: State) {
  if (!state.data) {
    return;
  }
  await updateState.mutateAsync({
    expectedRevision: state.data.revision,
    content: nextState,
  });
}
async function send() {
  if (!state.data) {
    return;
  }
  const response = await request.mutateAsync({
    url: state.data.content.serviceUrl,
    method: "POST",
    headers: [
      ["Content-Type", "text/plain"],
      ["Authorization", "Bearer app-supplied-token"],
    ],
    body: { encoding: "utf8", data: "Any opaque service payload" },
  });
  // Includes 4xx and 5xx responses; transport/permission errors reject instead.
  const bytes = Uint8Array.from(atob(response.body.data), (character) =>
    character.charCodeAt(0),
  );
  const text = new TextDecoder().decode(bytes);
  return {
    status: response.status,
    headers: response.headers,
    url: response.url,
    text,
  };
}
```

The host API accepts URL, optional method (GET by default), header pairs and an
optional opaque body. UTF-8 text uses `{ encoding: "utf8", data: string }`;
binary uses padded RFC 4648 base64 with `encoding: "base64"`. Responses always
return base64 bytes, status, header pairs and final URL. The app constructs and
interprets payloads. The host does not validate JSON or service business fields.
GET and HEAD cannot have bodies. CONNECT, TRACE, TRACK and routing headers
(Host, Content-Length, Connection, Transfer-Encoding, proxy/forwarding and Sec-*
headers) are controlled or rejected by the executor. App-supplied auth and
Cookie headers are allowed on desktop; browser fetch applies its own
forbidden-header rules. Superego never adds browser session credentials. TLS
certificate verification remains enabled. No cookie jar is maintained.

The desktop main process checks DNS and pins each connection, checks every
redirect, limits redirects to five and drops **all** app headers on an origin
change. A 303 changes non-HEAD requests to GET; 301/302 change POST to GET;
307/308 preserve method and body. New destinations must also be allowed.
Requests have a 30-second deadline and request/response bodies are limited to 16
MiB. The raw response is not automatically decompressed; request identity
encoding or decode content encodings in the app. Errors expose typed reasons
without including credentials, query values, bodies or headers in diagnostics.

Browser and demo runtimes execute the same API using browser fetch, with the
same stored app/version identity and exact destination origins. Requests omit
browser credentials and referrers. CORS still applies: configure the destination
to allow the Superego origin, or configure a CORS browser extension. Browser
transport failures (including CORS) return `TransportFailure` without sensitive
request details. Response headers are limited to those exposed by the browser,
and the browser decodes content encodings automatically.

Browser fetch cannot expose or pin the resolved IP address, so desktop DNS and
private-address enforcement cannot be reproduced in the browser. Browser local
network, mixed-content, TLS and extension policies remain in effect. Browser
redirects are rejected because their destinations cannot be inspected before
forwarding. Use a service's final URL. The same 30-second and 16 MiB limits
apply.

Previews disable this API with `UnsupportedRuntime`. Allowed destinations govern
requests through Superego; direct browser fetches and resource loads retain
existing networking/CORS policies. These permissions do not provide complete
network isolation.

State is shared by all instances of an app and survives reopen and code updates.
Writes replace the full schema-valid object and require its revision. Conflicts
return `AppStateError` with reason `RevisionConflict`; refetch and reconcile. No
File or DocumentRef types are supported, including nested/named definitions.
Other schema types use the existing JSON representation. Initial content is used
only when the app first acquires a state schema and never resets saved state.

New app versions require the expected previous version ID. Compatible state is
preserved. If it is incompatible, supply a synchronous default-exported
migration `(previousContent) => nextContent`; explicit migrations also support
semantic changes with an unchanged schema. Migrations run in the existing
isolated JavaScript sandbox without networking or app-editing APIs. Version and
state commit together or roll back together. Schema transitions reject obsolete
contexts and advance the state revision and schema identity. Code-only versions
preserve schema identity and do not replay earlier migrations. Removing a state
schema is rejected; deleting the app deletes state.

Mounted instances refresh with active versions. Desktop windows receive change
notifications; same-host instances share invalidations, and focus refetch is the
fallback when cross-window delivery is unavailable. Revocation cancels affected
HTTP requests where possible; already-sent requests cannot be undone.

Previews use separate ephemeral state initialized from the preview definition.
Migration trials run on preview initial content, never on saved content.
Previews keep baseline sandbox permissions and disable host HTTP. Test printing,
downloads and allowed destinations by running the saved app version. Existing
direct browser networking policies still apply in previews.

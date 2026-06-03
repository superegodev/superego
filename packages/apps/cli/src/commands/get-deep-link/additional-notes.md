`linkFormat` defaults to `desktop`, which returns a `superego://...` link. Use
`web` to return a clickable `https://open.superego.dev/...` redirect link for
chat surfaces that block custom URL schemes.

Web links send Superego resource IDs in the URL path to the redirect service.
Resource IDs can be sensitive. Superego does not store, analyze, or log them in
the Worker.

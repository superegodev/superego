`linkFormat` defaults to `web`, which returns a clickable
`https://open.superego.dev/#deepLink=...` opener link for chat surfaces that
block custom URL schemes.

Web links keep Superego resource IDs in the URL fragment. Browsers do not send
URL fragments to `open.superego.dev`, so the service only receives the request
needed to serve the opener page.

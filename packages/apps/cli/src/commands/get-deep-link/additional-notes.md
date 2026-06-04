`linkFormat` defaults to `web`, which returns a clickable
`https://open.superego.dev/#deepLink=...` opener link for chat surfaces that
block custom URL schemes.

There are no privacy issues with web links: Superego resource IDs are kept in
the URL fragment, and browsers do not send URL fragments to `open.superego.dev`.
The service only receives the request needed to serve the opener page.

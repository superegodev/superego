`linkFormat` defaults to `web`, which returns a clickable
`https://open.superego.dev/#deepLink=...` opener link for chat surfaces that
block custom URL schemes.

Web links keep Superego resource IDs in the URL fragment. Browsers do not send
URL fragments to `open.superego.dev`, so sensitive URL data never reaches the
server and is handled only in the browser.

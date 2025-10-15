---
title: Google Contacts
tableOfContents: false
---

This connector allows you to sync _persons_ from Google Contacts with one of
your collections. The connector only supports **syncing down**.

### Authentication

The connector authenticates with Google using OAuth 2.0 (PKCE flow).

If you've already set up authentication for the
[Google Calendar connector](/connectors/google-calendar#authentication), you
only need to add the `https://www.googleapis.com/auth/contacts` scope on the
[Data Access](https://console.cloud.google.com/auth/scopes) page.

If you haven't, follow the
[instructions for the Google Calendar connector](/connectors/google-calendar#authentication),
using `https://www.googleapis.com/auth/contacts` as the scope.

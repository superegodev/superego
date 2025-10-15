---
title: Strava Activities
tableOfContents: false
---

This connector allows you to sync _activities_ from Strava with one of your
collections. The connector only supports **syncing down**.

### Authentication

The connector authenticates with Strava using OAuth 2.0 (PKCE flow). To set up
this authentication mechanism, you'll need to:

1. Create a Strava OAuth 2.0 API application. You can find instructions in the
   **B. How to Create an Account** section of the
   [Strava API docs](https://developers.strava.com/docs/getting-started/). Use
   `localhost` as the Authorization Callback Domain.
2. Copy the Client ID and generated Client Secret into the connector
   configuration in Superego.

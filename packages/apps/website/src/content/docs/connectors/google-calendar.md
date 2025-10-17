---
title: Google Calendar
tableOfContents: false
---

This connector allows you to sync _events_ from Google Calendar with one of your
collections. The connector only supports **syncing down**.

### Settings

In the Google Calendar app, you have one _primary_ calendar and zero or more
additional ones. This connector syncs _one specific calendar_, which you
configure via the **Calendar ID** setting. You can set it to `primary` to target
your primary calendar, or use the full ID of a non-primary calendar, which you
can find on that calendar's settings page in Google Calendar.

### Authentication

The connector authenticates with Google using OAuth 2.0 (PKCE flow). To set up
this authentication mechanism, you'll need to:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and
   create a new project if you don't already have one.
2. From the project's
   [APIs & Services](https://console.cloud.google.com/apis/dashboard) dashboard,
   enable the **Google Calendar API**.
3. On the [Audience](https://console.cloud.google.com/auth/audience) page, add
   yourself as a test user (so you don't have to verify the app).
4. On the [Data Access](https://console.cloud.google.com/auth/scopes) page, add
   the `https://www.googleapis.com/auth/calendar` scope.
5. On the [Clients](https://console.cloud.google.com/auth/clients) page, create
   a `Desktop`-type OAuth 2.0 client.
6. Copy the Client ID and generated Client Secret into the connector
   configuration in Superego.

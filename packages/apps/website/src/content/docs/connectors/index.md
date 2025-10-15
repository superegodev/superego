---
title: Connectors
tableOfContents: false
---

You can sync a collection with an external data source (a **remote**). When a
remote is configured, it becomes the _source of truth_ for that collection.

The collection isn't necessarily an exact replica of the remote. Documents
pulled from the remote are transformed to match your collection's schema via
your `fromRemoteDocument` mapping, and you can filter which remote documents are
synced.

To set up a remote, configure a _connector_ to the external data source.

Some connectors support only **syncing down from** the remote, making the
collection read-only. Others also support **syncing up to** the remote, so
creates, updates, and deletes in the collection are propagated to the remote.

Superego currently supports the following connectors:

- [Google Calendar](/connectors/google-calendar)
- [Google Contacts](/connectors/google-contacts)
- [Strava Activities](/connectors/strava-activities)

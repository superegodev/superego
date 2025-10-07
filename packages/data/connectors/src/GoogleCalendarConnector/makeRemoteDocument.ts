import type { TypeOf } from "@superego/schema";
import type EventSchema from "./EventSchema.js";
import type {
  GoogleCalendarEvent,
  GoogleCalendarEventAttachment,
  GoogleCalendarEventAttendee,
  GoogleCalendarEventExtendedProperties,
  GoogleCalendarEventReminderOverride,
  GoogleCalendarEventReminders,
  GoogleCalendarEventSource,
} from "./types.js";

type Event = TypeOf<typeof EventSchema>;

export default function makeRemoteDocument(event: GoogleCalendarEvent): Event {
  const start = makeDateTime(event.start);
  const end = makeDateTime(event.end);
  const sequence = typeof event.sequence === "number" ? event.sequence : 0;
  const created = nonEmptyStringOr(event.created, new Date(0).toISOString());
  const updated = nonEmptyStringOr(event.updated, created);
  return {
    kind: nonEmptyStringOr(event.kind, "calendar#event"),
    etag: nonEmptyStringOr(event.etag, ""),
    id: nonEmptyStringOr(event.id, ""),
    status: nonEmptyStringOr(event.status, "confirmed"),
    htmlLink: nonEmptyStringOr(event.htmlLink, null),
    created,
    updated,
    summary: nonEmptyStringOr(event.summary, null),
    description: nonEmptyStringOr(event.description, null),
    location: nonEmptyStringOr(event.location, null),
    colorId: nonEmptyStringOr(event.colorId, null),
    creator: event.creator !== undefined ? makePerson(event.creator) : null,
    organizer:
      event.organizer !== undefined ? makePerson(event.organizer) : null,
    start,
    end,
    endTimeUnspecified: Boolean(event.endTimeUnspecified),
    recurrence: Array.isArray(event.recurrence)
      ? event.recurrence.filter((entry) => typeof entry === "string")
      : [],
    recurringEventId: nonEmptyStringOr(event.recurringEventId, null),
    originalStartTime:
      event.originalStartTime !== undefined
        ? makeDateTime(event.originalStartTime)
        : null,
    transparency: nonEmptyStringOr(event.transparency, null),
    visibility: nonEmptyStringOr(event.visibility, null),
    iCalUID: nonEmptyStringOr(event.iCalUID, null),
    sequence,
    attendees: Array.isArray(event.attendees)
      ? event.attendees.map(makeAttendee)
      : [],
    attendeesOmitted: Boolean(event.attendeesOmitted),
    extendedProperties: makeExtendedProperties(event.extendedProperties),
    hangoutLink: nonEmptyStringOr(event.hangoutLink, null),
    conferenceData:
      event.conferenceData && typeof event.conferenceData === "object"
        ? (event.conferenceData as Event["conferenceData"])
        : null,
    gadget:
      event.gadget && typeof event.gadget === "object"
        ? (event.gadget as Event["gadget"])
        : null,
    anyoneCanAddSelf: Boolean(event.anyoneCanAddSelf),
    guestsCanInviteOthers: Boolean(event.guestsCanInviteOthers),
    guestsCanModify: Boolean(event.guestsCanModify),
    guestsCanSeeOtherGuests: Boolean(event.guestsCanSeeOtherGuests),
    privateCopy: Boolean(event.privateCopy),
    locked: Boolean(event.locked),
    reminders: makeReminders(event.reminders),
    source: event.source !== undefined ? makeSource(event.source) : null,
    attachments: Array.isArray(event.attachments)
      ? event.attachments.map(makeAttachment)
      : [],
    eventType: nonEmptyStringOr(event.eventType, "default"),
  };
}

function makePerson(
  value: GoogleCalendarEvent["creator"],
): NonNullable<Event["creator"]> {
  return {
    id: nonEmptyStringOr(value?.id, null),
    email: nonEmptyStringOr(value?.email, null),
    displayName: nonEmptyStringOr(value?.displayName, null),
    self: Boolean(value?.self),
  };
}

function makeDateTime(value: GoogleCalendarEvent["start"]): Event["start"] {
  return {
    date: nonEmptyStringOr(value?.date, null),
    dateTime: nonEmptyStringOr(value?.dateTime, null),
    timeZone: nonEmptyStringOr(value?.timeZone, null),
  };
}

function makeAttendee(
  value: GoogleCalendarEventAttendee,
): Event["attendees"][number] {
  return {
    id: nonEmptyStringOr(value.id, null),
    email: nonEmptyStringOr(value.email, null),
    displayName: nonEmptyStringOr(value.displayName, null),
    organizer: Boolean(value.organizer),
    self: Boolean(value.self),
    resource: Boolean(value.resource),
    optional: Boolean(value.optional),
    responseStatus: nonEmptyStringOr(value.responseStatus, null),
    comment: nonEmptyStringOr(value.comment, null),
    additionalGuests:
      typeof value.additionalGuests === "number"
        ? value.additionalGuests
        : null,
  };
}

function makeExtendedProperties(
  value: GoogleCalendarEventExtendedProperties | undefined,
): Event["extendedProperties"] {
  if (!value) {
    return {
      private: null,
      shared: null,
    };
  }

  return {
    private:
      value.private && typeof value.private === "object"
        ? (value.private as Event["extendedProperties"]["private"])
        : null,
    shared:
      value.shared && typeof value.shared === "object"
        ? (value.shared as Event["extendedProperties"]["shared"])
        : null,
  };
}

function makeReminders(
  value: GoogleCalendarEventReminders | undefined,
): Event["reminders"] {
  const overridesSource = value?.overrides;
  const overrides = Array.isArray(overridesSource)
    ? overridesSource
        .map(makeReminderOverride)
        .filter((override) => override !== null)
    : [];

  return {
    useDefault:
      typeof value?.useDefault === "boolean" ? value.useDefault : true,
    overrides,
  };
}

function makeReminderOverride(
  value: GoogleCalendarEventReminderOverride,
): Event["reminders"]["overrides"][number] | null {
  const method = nonEmptyStringOr(value.method, null);
  if (method === null || typeof value.minutes !== "number") {
    return null;
  }
  return {
    method,
    minutes: value.minutes,
  };
}

function makeSource(
  value: GoogleCalendarEventSource,
): NonNullable<Event["source"]> {
  return {
    url: nonEmptyStringOr(value.url, null),
    title: nonEmptyStringOr(value.title, null),
  };
}

function makeAttachment(
  value: GoogleCalendarEventAttachment,
): Event["attachments"][number] {
  return {
    fileUrl: nonEmptyStringOr(value.fileUrl, null),
    title: nonEmptyStringOr(value.title, null),
    mimeType: nonEmptyStringOr(value.mimeType, null),
    iconLink: nonEmptyStringOr(value.iconLink, null),
    fileId: nonEmptyStringOr(value.fileId, null),
  };
}

function nonEmptyStringOr<Fallback extends string | null>(
  value: unknown,
  fallback: Fallback,
): string | Fallback {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

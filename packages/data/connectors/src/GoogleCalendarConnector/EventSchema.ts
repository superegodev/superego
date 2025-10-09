import { DataType, type Schema } from "@superego/schema";

export default {
  types: {
    DateTime: {
      dataType: DataType.Struct,
      description:
        "Represents the start or end instant of an event as returned by the Google Calendar API.",
      properties: {
        date: {
          dataType: DataType.String,
          description:
            "All-day event date in the calendar's locale (RFC3339 full-date). Null when the event has a specific start/end time.",
        },
        dateTime: {
          dataType: DataType.String,
          description:
            "Exact date and time of the event (RFC3339 timestamp with offset). Null for all-day events that only set `date`.",
        },
        timeZone: {
          dataType: DataType.String,
          description:
            "IANA time zone identifier overriding the calendar's default time zone. Null when the calendar default time zone applies.",
        },
      },
      nullableProperties: ["date", "dateTime", "timeZone"],
    },
    Person: {
      dataType: DataType.Struct,
      description:
        "Participant metadata describing the creator or organizer of an event.",
      properties: {
        id: {
          dataType: DataType.String,
          description:
            "Persistent identifier for the calendar participant. Null when the participant lacks a stable ID (e.g., external guest).",
        },
        email: {
          dataType: DataType.String,
          description:
            "Email address associated with the calendar participant. Null when the address is hidden or unavailable.",
        },
        displayName: {
          dataType: DataType.String,
          description:
            "Human-friendly name of the participant. Null when Google Calendar cannot infer a display name.",
        },
        self: {
          dataType: DataType.Boolean,
          description:
            "Indicates the participant corresponds to the authenticated user.",
        },
      },
      nullableProperties: ["id", "email", "displayName"],
    },
    Attendee: {
      dataType: DataType.Struct,
      description: "Detailed information about a single attendee on the event.",
      properties: {
        id: {
          dataType: DataType.String,
          description:
            "Opaque attendee identifier assigned by Google Calendar. Null when the attendee is an ad-hoc guest without a stored ID.",
        },
        email: {
          dataType: DataType.String,
          description:
            "Email address of the attendee. Null when the attendee does not expose an email address.",
        },
        displayName: {
          dataType: DataType.String,
          description:
            "Display name for the attendee. Null when no name is available.",
        },
        organizer: {
          dataType: DataType.Boolean,
          description: "True if the attendee is the event organizer.",
        },
        self: {
          dataType: DataType.Boolean,
          description:
            "True if the attendee represents the calendar where the event is viewed.",
        },
        resource: {
          dataType: DataType.Boolean,
          description: "True if the attendee is a room or equipment resource.",
        },
        optional: {
          dataType: DataType.Boolean,
          description: "True if the attendee is marked as optional.",
        },
        responseStatus: {
          dataType: DataType.String,
          description:
            "Attendee response such as 'accepted', 'declined', or 'needsAction'. Null when the attendee has not responded yet.",
        },
        comment: {
          dataType: DataType.String,
          description:
            "Additional notes provided by the attendee. Null when no comment is stored.",
        },
        additionalGuests: {
          dataType: DataType.Number,
          description:
            "Number of extra guests accompanying the attendee. Null when unspecified by the attendee.",
        },
      },
      nullableProperties: [
        "id",
        "email",
        "displayName",
        "responseStatus",
        "comment",
        "additionalGuests",
      ],
    },
    ReminderOverride: {
      dataType: DataType.Struct,
      description:
        "Custom reminder settings overriding the calendar default reminder.",
      properties: {
        method: {
          dataType: DataType.String,
          description: "Delivery method for the reminder (email, popup, etc.).",
        },
        minutes: {
          dataType: DataType.Number,
          description:
            "Minutes before the start time when the reminder is triggered.",
        },
      },
    },
    Reminders: {
      dataType: DataType.Struct,
      description: "Container for reminder configuration applied to the event.",
      properties: {
        useDefault: {
          dataType: DataType.Boolean,
          description:
            "Indicates whether the calendar's default reminders are used.",
        },
        overrides: {
          dataType: DataType.List,
          description: "Custom reminders replacing the calendar defaults.",
          items: {
            dataType: null,
            ref: "ReminderOverride",
            description: "Definition of a single reminder override.",
          },
        },
      },
    },
    ExtendedProperties: {
      dataType: DataType.Struct,
      description:
        "Extended properties for private and shared key-value metadata.",
      properties: {
        private: {
          dataType: DataType.JsonObject,
          description:
            "User-provided private custom key/value pairs. Null when no private extended properties exist.",
        },
        shared: {
          dataType: DataType.JsonObject,
          description:
            "User-provided shared custom key/value pairs. Null when no shared extended properties exist.",
        },
      },
      nullableProperties: ["private", "shared"],
    },
    Source: {
      dataType: DataType.Struct,
      description:
        "Origin details for an imported event, such as a link to the original source.",
      properties: {
        url: {
          dataType: DataType.String,
          description:
            "URL pointing to the original source of the event. Null when the event does not originate from an external source.",
        },
        title: {
          dataType: DataType.String,
          description:
            "Title describing the original source of the event. Null when only a URL is provided or the source is unknown.",
        },
      },
      nullableProperties: ["url", "title"],
    },
    Attachment: {
      dataType: DataType.Struct,
      description:
        "Metadata about files attached to the event, typically from Google Drive.",
      properties: {
        fileUrl: {
          dataType: DataType.String,
          description:
            "Link to access the attached file. Null when the attachment is inaccessible to the requester.",
        },
        title: {
          dataType: DataType.String,
          description:
            "Attachment title displayed to users. Null when the file lacks a title.",
        },
        mimeType: {
          dataType: DataType.String,
          description:
            "MIME type of the attached file. Null when Google Calendar cannot determine the file type.",
        },
        iconLink: {
          dataType: DataType.String,
          description:
            "URL for a thumbnail representing the attached file. Null when no preview icon is available.",
        },
        fileId: {
          dataType: DataType.String,
          description:
            "Drive API file identifier for the attachment. Null for attachments not stored in Google Drive.",
        },
      },
      nullableProperties: [
        "fileUrl",
        "title",
        "mimeType",
        "iconLink",
        "fileId",
      ],
    },
    Event: {
      dataType: DataType.Struct,
      description:
        "Schema for the Event resource returned by the Google Calendar API.",
      properties: {
        kind: {
          dataType: DataType.String,
          description: "Resource type, always 'calendar#event'.",
        },
        etag: {
          dataType: DataType.String,
          description:
            "Version identifier for incremental synchronization and caching.",
        },
        id: {
          dataType: DataType.String,
          description: "Stable event identifier unique within the calendar.",
        },
        status: {
          dataType: DataType.String,
          description:
            "Event status such as 'confirmed', 'tentative', or 'cancelled'.",
        },
        htmlLink: {
          dataType: DataType.String,
          description:
            "Link to the event details in the Google Calendar UI. Null when the event is not accessible via the web interface.",
        },
        created: {
          dataType: DataType.String,
          description:
            "Creation timestamp (RFC3339) for the event in the calendar store.",
        },
        updated: {
          dataType: DataType.String,
          description:
            "Last modification timestamp (RFC3339) for the event metadata.",
        },
        summary: {
          dataType: DataType.String,
          description:
            "Short title or subject of the event. Null when the creator leaves the summary blank.",
        },
        description: {
          dataType: DataType.String,
          description:
            "Detailed description or agenda notes for the event. Null when no description is provided.",
        },
        location: {
          dataType: DataType.String,
          description:
            "Geographic location or descriptive place where the event occurs. Null when no location is set.",
        },
        colorId: {
          dataType: DataType.String,
          description:
            "Identifier referencing a user-defined event color. Null when the default calendar color applies.",
        },
        creator: {
          dataType: null,
          ref: "Person",
          description:
            "Information about the user who created the event. Null when the API omits creator metadata.",
        },
        organizer: {
          dataType: null,
          ref: "Person",
          description:
            "The calendar or person responsible for the event. Null for imported events where the organizer is unknown.",
        },
        start: {
          dataType: null,
          ref: "DateTime",
          description: "Start time of the event.",
        },
        end: {
          dataType: null,
          ref: "DateTime",
          description: "End time of the event.",
        },
        endTimeUnspecified: {
          dataType: DataType.Boolean,
          description:
            "True if the event has no specified end time (only start).",
        },
        recurrence: {
          dataType: DataType.List,
          description:
            "List of RRULE strings describing the recurrence pattern.",
          items: {
            dataType: DataType.String,
            description: "RFC5545 recurrence rule string.",
          },
        },
        recurringEventId: {
          dataType: DataType.String,
          description:
            "Identifier of the recurring event this instance belongs to. Null for standalone (non-recurring) events.",
        },
        originalStartTime: {
          dataType: null,
          ref: "DateTime",
          description:
            "Start time information for the recurring event instance. Null when the event is not an overridden recurrence.",
        },
        transparency: {
          dataType: DataType.String,
          description:
            "Indicates whether the event blocks time on calendars. Null when the calendar default transparency is used.",
        },
        visibility: {
          dataType: DataType.String,
          description:
            "Sharing visibility setting, e.g. 'default', 'public', 'private'. Null when the calendar default visibility applies.",
        },
        iCalUID: {
          dataType: DataType.String,
          description:
            "Event identifier used in iCalendar export, stable across copies. Null when no iCal UID is assigned.",
        },
        sequence: {
          dataType: DataType.Number,
          description:
            "Revision number incremented each time the event is updated.",
        },
        attendees: {
          dataType: DataType.List,
          description: "Attendee list including people and resources.",
          items: {
            dataType: null,
            ref: "Attendee",
            description: "Metadata for an individual attendee.",
          },
        },
        attendeesOmitted: {
          dataType: DataType.Boolean,
          description:
            "True if the attendees list is truncated for privacy reasons.",
        },
        extendedProperties: {
          dataType: null,
          ref: "ExtendedProperties",
          description:
            "Custom key/value metadata scoped to private or shared visibility. Null when no extended properties are present.",
        },
        hangoutLink: {
          dataType: DataType.String,
          description:
            "Deprecated link to the classic Hangouts meeting. Null when the event does not include a Hangouts link.",
        },
        conferenceData: {
          dataType: DataType.JsonObject,
          description:
            "Conference solution metadata (e.g., Google Meet join info). Null when no conference is attached.",
        },
        gadget: {
          dataType: DataType.JsonObject,
          description:
            "Legacy gadget metadata from the Google Calendar API. Null when no gadget is configured.",
        },
        anyoneCanAddSelf: {
          dataType: DataType.Boolean,
          description: "True if attendees can invite themselves to the event.",
        },
        guestsCanInviteOthers: {
          dataType: DataType.Boolean,
          description: "True if attendees are allowed to invite other guests.",
        },
        guestsCanModify: {
          dataType: DataType.Boolean,
          description: "True if attendees can modify the event details.",
        },
        guestsCanSeeOtherGuests: {
          dataType: DataType.Boolean,
          description: "True if attendees can view the list of other guests.",
        },
        privateCopy: {
          dataType: DataType.Boolean,
          description:
            "True if this copy of the event is a private clone on a shared calendar.",
        },
        locked: {
          dataType: DataType.Boolean,
          description: "True if the event cannot be modified by attendees.",
        },
        reminders: {
          dataType: null,
          ref: "Reminders",
          description: "Reminder configuration applied to the event instance.",
        },
        source: {
          dataType: null,
          ref: "Source",
          description:
            "Original source details for imported events. Null when the event originates in Google Calendar.",
        },
        attachments: {
          dataType: DataType.List,
          description: "Attachments associated with the event.",
          items: {
            dataType: null,
            ref: "Attachment",
            description: "Metadata describing a single event attachment.",
          },
        },
        eventType: {
          dataType: DataType.String,
          description:
            "Event type such as 'default', 'focusTime', or 'outOfOffice'.",
        },
      },
      nullableProperties: [
        "htmlLink",
        "summary",
        "description",
        "location",
        "colorId",
        "creator",
        "organizer",
        "recurringEventId",
        "originalStartTime",
        "transparency",
        "visibility",
        "iCalUID",
        "hangoutLink",
        "conferenceData",
        "gadget",
        "source",
      ],
    },
  },
  rootType: "Event",
} as const satisfies Schema;

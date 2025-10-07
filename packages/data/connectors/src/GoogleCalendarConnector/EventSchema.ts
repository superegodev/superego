import { DataType, type Schema } from "@superego/schema";

export default {
  types: {
    DateTime: {
      dataType: DataType.Struct,
      properties: {
        date: {
          dataType: DataType.String,
        },
        dateTime: {
          dataType: DataType.String,
        },
        timeZone: {
          dataType: DataType.String,
        },
      },
      nullableProperties: ["date", "dateTime", "timeZone"],
    },
    Person: {
      dataType: DataType.Struct,
      properties: {
        id: {
          dataType: DataType.String,
        },
        email: {
          dataType: DataType.String,
        },
        displayName: {
          dataType: DataType.String,
        },
        self: {
          dataType: DataType.Boolean,
        },
      },
      nullableProperties: ["id", "email", "displayName"],
    },
    Attendee: {
      dataType: DataType.Struct,
      properties: {
        id: {
          dataType: DataType.String,
        },
        email: {
          dataType: DataType.String,
        },
        displayName: {
          dataType: DataType.String,
        },
        organizer: {
          dataType: DataType.Boolean,
        },
        self: {
          dataType: DataType.Boolean,
        },
        resource: {
          dataType: DataType.Boolean,
        },
        optional: {
          dataType: DataType.Boolean,
        },
        responseStatus: {
          dataType: DataType.String,
        },
        comment: {
          dataType: DataType.String,
        },
        additionalGuests: {
          dataType: DataType.Number,
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
      properties: {
        method: {
          dataType: DataType.String,
        },
        minutes: {
          dataType: DataType.Number,
        },
      },
    },
    Reminders: {
      dataType: DataType.Struct,
      properties: {
        useDefault: {
          dataType: DataType.Boolean,
        },
        overrides: {
          dataType: DataType.List,
          items: {
            dataType: null,
            ref: "ReminderOverride",
          },
        },
      },
    },
    ExtendedProperties: {
      dataType: DataType.Struct,
      properties: {
        private: {
          dataType: DataType.JsonObject,
        },
        shared: {
          dataType: DataType.JsonObject,
        },
      },
      nullableProperties: ["private", "shared"],
    },
    Source: {
      dataType: DataType.Struct,
      properties: {
        url: {
          dataType: DataType.String,
        },
        title: {
          dataType: DataType.String,
        },
      },
      nullableProperties: ["url", "title"],
    },
    Attachment: {
      dataType: DataType.Struct,
      properties: {
        fileUrl: {
          dataType: DataType.String,
        },
        title: {
          dataType: DataType.String,
        },
        mimeType: {
          dataType: DataType.String,
        },
        iconLink: {
          dataType: DataType.String,
        },
        fileId: {
          dataType: DataType.String,
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
      properties: {
        kind: {
          dataType: DataType.String,
        },
        etag: {
          dataType: DataType.String,
        },
        id: {
          dataType: DataType.String,
        },
        status: {
          dataType: DataType.String,
        },
        htmlLink: {
          dataType: DataType.String,
        },
        created: {
          dataType: DataType.String,
        },
        updated: {
          dataType: DataType.String,
        },
        summary: {
          dataType: DataType.String,
        },
        description: {
          dataType: DataType.String,
        },
        location: {
          dataType: DataType.String,
        },
        colorId: {
          dataType: DataType.String,
        },
        creator: {
          dataType: null,
          ref: "Person",
        },
        organizer: {
          dataType: null,
          ref: "Person",
        },
        start: {
          dataType: null,
          ref: "DateTime",
        },
        end: {
          dataType: null,
          ref: "DateTime",
        },
        endTimeUnspecified: {
          dataType: DataType.Boolean,
        },
        recurrence: {
          dataType: DataType.List,
          items: {
            dataType: DataType.String,
          },
        },
        recurringEventId: {
          dataType: DataType.String,
        },
        originalStartTime: {
          dataType: null,
          ref: "DateTime",
        },
        transparency: {
          dataType: DataType.String,
        },
        visibility: {
          dataType: DataType.String,
        },
        iCalUID: {
          dataType: DataType.String,
        },
        sequence: {
          dataType: DataType.Number,
        },
        attendees: {
          dataType: DataType.List,
          items: {
            dataType: null,
            ref: "Attendee",
          },
        },
        attendeesOmitted: {
          dataType: DataType.Boolean,
        },
        extendedProperties: {
          dataType: null,
          ref: "ExtendedProperties",
        },
        hangoutLink: {
          dataType: DataType.String,
        },
        conferenceData: {
          dataType: DataType.JsonObject,
        },
        gadget: {
          dataType: DataType.JsonObject,
        },
        anyoneCanAddSelf: {
          dataType: DataType.Boolean,
        },
        guestsCanInviteOthers: {
          dataType: DataType.Boolean,
        },
        guestsCanModify: {
          dataType: DataType.Boolean,
        },
        guestsCanSeeOtherGuests: {
          dataType: DataType.Boolean,
        },
        privateCopy: {
          dataType: DataType.Boolean,
        },
        locked: {
          dataType: DataType.Boolean,
        },
        reminders: {
          dataType: null,
          ref: "Reminders",
        },
        source: {
          dataType: null,
          ref: "Source",
        },
        attachments: {
          dataType: DataType.List,
          items: {
            dataType: null,
            ref: "Attachment",
          },
        },
        eventType: {
          dataType: DataType.String,
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

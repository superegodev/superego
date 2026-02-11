import { DataType, type Schema } from "@superego/schema";

export default {
  types: {
    Type: {
      description: "Type of contact.",
      dataType: DataType.Enum,
      members: {
        Person: {
          description: "A single human",
          value: "Person",
        },
        Organization: {
          description: "A company, non-profit, government entity, group, etc",
          value: "Organization",
        },
      },
    },
    Phone: {
      dataType: DataType.Struct,
      properties: {
        number: {
          description: "The actual phone number.",
          dataType: DataType.String,
        },
        description: {
          description:
            "A description for the phone number. (Personal, work, etc.)",
          dataType: DataType.String,
        },
      },
      nullableProperties: ["description"],
    },
    Email: {
      dataType: DataType.Struct,
      properties: {
        address: {
          description: "The actual email address.",
          dataType: DataType.String,
        },
        description: {
          description:
            "A description for the email address. (Personal, work, etc.)",
          dataType: DataType.String,
        },
      },
      nullableProperties: ["description"],
    },
    Contact: {
      description: "A contact in my address book.",
      dataType: DataType.Struct,
      properties: {
        type: {
          dataType: null,
          ref: "Type",
        },
        name: {
          description:
            "Name of the contact. Either the full name for a person, or the organization name for an organization.",
          dataType: DataType.String,
        },
        relation: {
          description: "Who they are to me.",
          dataType: DataType.String,
        },
        phones: {
          description: "Their phone numbers",
          dataType: DataType.List,
          items: {
            dataType: null,
            ref: "Phone",
          },
        },
        emails: {
          description: "Their email addresses",
          dataType: DataType.List,
          items: {
            dataType: null,
            ref: "Email",
          },
        },
        notes: {
          description: "Misc notes about the contact",
          dataType: DataType.JsonObject,
          format: "dev.superego:JsonObject.TiptapRichText",
        },
      },
      nullableProperties: ["relation", "notes"],
    },
  },
  rootType: "Contact",
} as const satisfies Schema;

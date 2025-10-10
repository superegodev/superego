import { DataType, type Schema } from "@superego/schema";

export default {
  types: {
    Date: {
      dataType: DataType.Struct,
      description:
        "Represents a calendar date returned by the Google People API. Fields may be missing when the source omits them.",
      properties: {
        year: {
          dataType: DataType.Number,
          description:
            "Four digit year component of the date. Null when the source omits the year.",
        },
        month: {
          dataType: DataType.Number,
          description:
            "Month number in the range 1-12. Null when the source omits the month.",
        },
        day: {
          dataType: DataType.Number,
          description:
            "Day number in the range 1-31. Null when the source omits the day.",
        },
      },
      nullableProperties: ["year", "month", "day"],
    },
    FieldSource: {
      dataType: DataType.Struct,
      description:
        "Source identifier describing where the data point originated within Google Contacts.",
      properties: {
        type: {
          dataType: DataType.String,
          description:
            "Type of the source (for example CONTACT, PROFILE). Null when unavailable.",
        },
        id: {
          dataType: DataType.String,
          description:
            "Opaque identifier for the source record. Null when unavailable.",
        },
        etag: {
          dataType: DataType.String,
          description:
            "Etag associated with the sourced record. Null when unavailable.",
        },
      },
      nullableProperties: ["type", "id", "etag"],
    },
    FieldMetadata: {
      dataType: DataType.Struct,
      description:
        "Metadata describing a particular person field returned by the People API.",
      properties: {
        primary: {
          dataType: DataType.Boolean,
          description:
            "Indicates whether this field is marked as the primary value.",
        },
        verified: {
          dataType: DataType.Boolean,
          description:
            "Indicates whether the value has been verified by Google.",
        },
        source: {
          dataType: null,
          ref: "FieldSource",
          description:
            "Information about the source record that produced this field. Null when unavailable.",
        },
      },
      nullableProperties: ["source"],
    },
    PersonMetadataSource: {
      dataType: DataType.Struct,
      description:
        "Metadata about the origin of the person record at the connection level.",
      properties: {
        type: {
          dataType: DataType.String,
          description:
            "Type of the source (for example CONTACT or PROFILE). Null when unavailable.",
        },
        id: {
          dataType: DataType.String,
          description:
            "Identifier for the person source. Null when unavailable.",
        },
        etag: {
          dataType: DataType.String,
          description:
            "Etag associated with the person source. Null when unavailable.",
        },
      },
      nullableProperties: ["type", "id", "etag"],
    },
    PersonMetadata: {
      dataType: DataType.Struct,
      description:
        "Top level metadata describing the contact record returned by the Google People API.",
      properties: {
        deleted: {
          dataType: DataType.Boolean,
          description:
            "True when the contact has been deleted and should be treated as removed.",
        },
        sources: {
          dataType: DataType.List,
          description:
            "Collection of sources contributing to this person record.",
          items: {
            dataType: null,
            ref: "PersonMetadataSource",
            description:
              "Details about a single source contributing to the contact.",
          },
        },
      },
    },
    Name: {
      dataType: DataType.Struct,
      description: "Formatted and componentized name data for the contact.",
      properties: {
        metadata: {
          dataType: null,
          ref: "FieldMetadata",
          description:
            "Metadata describing this name entry. Null when unavailable.",
        },
        displayName: {
          dataType: DataType.String,
          description:
            "Full display name for the contact. Null when unavailable.",
        },
        displayNameLastFirst: {
          dataType: DataType.String,
          description:
            "Display name in last-name-first format. Null when unavailable.",
        },
        givenName: {
          dataType: DataType.String,
          description: "First name of the contact. Null when unavailable.",
        },
        middleName: {
          dataType: DataType.String,
          description: "Middle name of the contact. Null when unavailable.",
        },
        familyName: {
          dataType: DataType.String,
          description:
            "Family name (surname) of the contact. Null when unavailable.",
        },
        honorificPrefix: {
          dataType: DataType.String,
          description:
            "Honorific prefix such as Mr., Ms., or Dr. Null when unavailable.",
        },
        honorificSuffix: {
          dataType: DataType.String,
          description:
            "Honorific suffix such as Jr. or III. Null when unavailable.",
        },
        phoneticFullName: {
          dataType: DataType.String,
          description:
            "Phonetic rendering of the full name. Null when unavailable.",
        },
        phoneticGivenName: {
          dataType: DataType.String,
          description:
            "Phonetic rendering of the given name. Null when unavailable.",
        },
        phoneticFamilyName: {
          dataType: DataType.String,
          description:
            "Phonetic rendering of the family name. Null when unavailable.",
        },
      },
      nullableProperties: [
        "metadata",
        "displayName",
        "displayNameLastFirst",
        "givenName",
        "middleName",
        "familyName",
        "honorificPrefix",
        "honorificSuffix",
        "phoneticFullName",
        "phoneticGivenName",
        "phoneticFamilyName",
      ],
    },
    EmailAddress: {
      dataType: DataType.Struct,
      description: "Email address entry for the contact.",
      properties: {
        metadata: {
          dataType: null,
          ref: "FieldMetadata",
          description:
            "Metadata describing this email address. Null when unavailable.",
        },
        value: {
          dataType: DataType.String,
          description: "Email address value. Null when unavailable.",
        },
        type: {
          dataType: DataType.String,
          description:
            "Free form type label for the email address. Null when unavailable.",
        },
        formattedType: {
          dataType: DataType.String,
          description:
            "Localized label for the email address type. Null when unavailable.",
        },
        displayName: {
          dataType: DataType.String,
          description:
            "Display name associated with the email address. Null when unavailable.",
        },
      },
      nullableProperties: [
        "metadata",
        "value",
        "type",
        "formattedType",
        "displayName",
      ],
    },
    PhoneNumber: {
      dataType: DataType.Struct,
      description: "Phone number entry for the contact.",
      properties: {
        metadata: {
          dataType: null,
          ref: "FieldMetadata",
          description:
            "Metadata describing this phone number. Null when unavailable.",
        },
        value: {
          dataType: DataType.String,
          description: "Dialable phone number string. Null when unavailable.",
        },
        canonicalForm: {
          dataType: DataType.String,
          description:
            "Canonicalized E.164 formatted phone number. Null when unavailable.",
        },
        type: {
          dataType: DataType.String,
          description:
            "Free form type label for the phone number. Null when unavailable.",
        },
        formattedType: {
          dataType: DataType.String,
          description:
            "Localized label for the phone number type. Null when unavailable.",
        },
      },
      nullableProperties: [
        "metadata",
        "value",
        "canonicalForm",
        "type",
        "formattedType",
      ],
    },
    Address: {
      dataType: DataType.Struct,
      description: "Postal address entry for the contact.",
      properties: {
        metadata: {
          dataType: null,
          ref: "FieldMetadata",
          description:
            "Metadata describing this address. Null when unavailable.",
        },
        formattedValue: {
          dataType: DataType.String,
          description:
            "Formatted representation of the address. Null when unavailable.",
        },
        type: {
          dataType: DataType.String,
          description:
            "Free form type label for the address. Null when unavailable.",
        },
        formattedType: {
          dataType: DataType.String,
          description:
            "Localized label for the address type. Null when unavailable.",
        },
        streetAddress: {
          dataType: DataType.String,
          description: "Street address component. Null when unavailable.",
        },
        poBox: {
          dataType: DataType.String,
          description: "Post office box component. Null when unavailable.",
        },
        city: {
          dataType: DataType.String,
          description: "City component of the address. Null when unavailable.",
        },
        region: {
          dataType: DataType.String,
          description: "Region or state component. Null when unavailable.",
        },
        postalCode: {
          dataType: DataType.String,
          description: "Postal code component. Null when unavailable.",
        },
        country: {
          dataType: DataType.String,
          description:
            "Country component of the address. Null when unavailable.",
        },
        countryCode: {
          dataType: DataType.String,
          description:
            "CLDR country code for the address. Null when unavailable.",
        },
      },
      nullableProperties: [
        "metadata",
        "formattedValue",
        "type",
        "formattedType",
        "streetAddress",
        "poBox",
        "city",
        "region",
        "postalCode",
        "country",
        "countryCode",
      ],
    },
    Biography: {
      dataType: DataType.Struct,
      description: "Biography or notes associated with the contact.",
      properties: {
        metadata: {
          dataType: null,
          ref: "FieldMetadata",
          description:
            "Metadata describing this biography entry. Null when unavailable.",
        },
        value: {
          dataType: DataType.String,
          description: "Biography text. Null when unavailable.",
        },
        contentType: {
          dataType: DataType.String,
          description:
            "Content type describing how to interpret the biography. Null when unavailable.",
        },
      },
      nullableProperties: ["metadata", "value", "contentType"],
    },
    Event: {
      dataType: DataType.Struct,
      description:
        "Special event associated with the contact (e.g. anniversary).",
      properties: {
        metadata: {
          dataType: null,
          ref: "FieldMetadata",
          description:
            "Metadata describing this event entry. Null when unavailable.",
        },
        type: {
          dataType: DataType.String,
          description:
            "Type of the event (e.g. anniversary). Null when unavailable.",
        },
        date: {
          dataType: null,
          ref: "Date",
          description: "Calendar date of the event. Null when unavailable.",
        },
      },
      nullableProperties: ["metadata", "type", "date"],
    },
    Birthday: {
      dataType: DataType.Struct,
      description: "Birthday information for the contact.",
      properties: {
        metadata: {
          dataType: null,
          ref: "FieldMetadata",
          description:
            "Metadata describing this birthday entry. Null when unavailable.",
        },
        text: {
          dataType: DataType.String,
          description:
            "Unparsed birthday text when the structured date is unavailable.",
        },
        date: {
          dataType: null,
          ref: "Date",
          description: "Structured birthday date. Null when unavailable.",
        },
      },
      nullableProperties: ["metadata", "text", "date"],
    },
    ImClient: {
      dataType: DataType.Struct,
      description: "Instant messaging identifier for the contact.",
      properties: {
        metadata: {
          dataType: null,
          ref: "FieldMetadata",
          description:
            "Metadata describing this IM client entry. Null when unavailable.",
        },
        username: {
          dataType: DataType.String,
          description: "Instant messaging username. Null when unavailable.",
        },
        protocol: {
          dataType: DataType.String,
          description:
            "Protocol identifier (e.g. hangouts). Null when unavailable.",
        },
        formattedProtocol: {
          dataType: DataType.String,
          description: "Localized protocol description. Null when unavailable.",
        },
        type: {
          dataType: DataType.String,
          description:
            "Type label for the instant messaging account. Null when unavailable.",
        },
        formattedType: {
          dataType: DataType.String,
          description:
            "Localized label for the instant messaging account type. Null when unavailable.",
        },
      },
      nullableProperties: [
        "metadata",
        "username",
        "protocol",
        "formattedProtocol",
        "type",
        "formattedType",
      ],
    },
    Interest: {
      dataType: DataType.Struct,
      description: "Interest metadata associated with the contact.",
      properties: {
        metadata: {
          dataType: null,
          ref: "FieldMetadata",
          description:
            "Metadata describing this interest entry. Null when unavailable.",
        },
        value: {
          dataType: DataType.String,
          description: "Interest text. Null when unavailable.",
        },
      },
      nullableProperties: ["metadata", "value"],
    },
    Location: {
      dataType: DataType.Struct,
      description: "Location information associated with the contact.",
      properties: {
        metadata: {
          dataType: null,
          ref: "FieldMetadata",
          description:
            "Metadata describing this location entry. Null when unavailable.",
        },
        value: {
          dataType: DataType.String,
          description: "Location text. Null when unavailable.",
        },
        type: {
          dataType: DataType.String,
          description: "Type label for the location. Null when unavailable.",
        },
        current: {
          dataType: DataType.Boolean,
          description: "True when the location is marked as current.",
        },
      },
      nullableProperties: ["metadata", "value", "type"],
    },
    Membership: {
      dataType: DataType.Struct,
      description: "Contact group or domain membership for the contact.",
      properties: {
        metadata: {
          dataType: null,
          ref: "FieldMetadata",
          description:
            "Metadata describing this membership entry. Null when unavailable.",
        },
        contactGroupMembership: {
          dataType: DataType.Struct,
          description:
            "Membership details for a specific contact group. Null when unavailable.",
          properties: {
            contactGroupId: {
              dataType: DataType.String,
              description:
                "Identifier for the contact group. Null when unavailable.",
            },
            contactGroupResourceName: {
              dataType: DataType.String,
              description:
                "Resource name for the contact group. Null when unavailable.",
            },
          },
          nullableProperties: ["contactGroupId", "contactGroupResourceName"],
        },
        domainMembership: {
          dataType: DataType.Struct,
          description:
            "Membership details for a Google Workspace domain. Null when unavailable.",
          properties: {
            inViewerDomain: {
              dataType: DataType.Boolean,
              description:
                "True when the contact belongs to the same domain as the viewer.",
            },
          },
        },
      },
      nullableProperties: [
        "metadata",
        "contactGroupMembership",
        "domainMembership",
      ],
    },
    Nickname: {
      dataType: DataType.Struct,
      description: "Nickname associated with the contact.",
      properties: {
        metadata: {
          dataType: null,
          ref: "FieldMetadata",
          description:
            "Metadata describing this nickname entry. Null when unavailable.",
        },
        value: {
          dataType: DataType.String,
          description: "Nickname text. Null when unavailable.",
        },
        type: {
          dataType: DataType.String,
          description: "Type label for the nickname. Null when unavailable.",
        },
      },
      nullableProperties: ["metadata", "value", "type"],
    },
    Occupation: {
      dataType: DataType.Struct,
      description: "Occupation entry associated with the contact.",
      properties: {
        metadata: {
          dataType: null,
          ref: "FieldMetadata",
          description:
            "Metadata describing this occupation entry. Null when unavailable.",
        },
        value: {
          dataType: DataType.String,
          description: "Occupation text. Null when unavailable.",
        },
      },
      nullableProperties: ["metadata", "value"],
    },
    Organization: {
      dataType: DataType.Struct,
      description: "Organization that the contact is or was associated with.",
      properties: {
        metadata: {
          dataType: null,
          ref: "FieldMetadata",
          description:
            "Metadata describing this organization entry. Null when unavailable.",
        },
        name: {
          dataType: DataType.String,
          description: "Organization name. Null when unavailable.",
        },
        title: {
          dataType: DataType.String,
          description: "Title held at the organization. Null when unavailable.",
        },
        department: {
          dataType: DataType.String,
          description:
            "Department within the organization. Null when unavailable.",
        },
        jobDescription: {
          dataType: DataType.String,
          description:
            "Job description or role details. Null when unavailable.",
        },
        symbol: {
          dataType: DataType.String,
          description:
            "Ticker symbol or shorthand for the organization. Null when unavailable.",
        },
        domain: {
          dataType: DataType.String,
          description:
            "Domain name associated with the organization. Null when unavailable.",
        },
        startDate: {
          dataType: null,
          ref: "Date",
          description:
            "Date when the contact joined the organization. Null when unavailable.",
        },
        endDate: {
          dataType: null,
          ref: "Date",
          description:
            "Date when the contact left the organization. Null when unavailable.",
        },
        current: {
          dataType: DataType.Boolean,
          description: "True when the organization entry is marked as current.",
        },
      },
      nullableProperties: [
        "metadata",
        "name",
        "title",
        "department",
        "jobDescription",
        "symbol",
        "domain",
        "startDate",
        "endDate",
      ],
    },
    Photo: {
      dataType: DataType.Struct,
      description: "Photo metadata associated with the contact.",
      properties: {
        metadata: {
          dataType: null,
          ref: "FieldMetadata",
          description:
            "Metadata describing this photo entry. Null when unavailable.",
        },
        url: {
          dataType: DataType.String,
          description: "URL to fetch the contact photo. Null when unavailable.",
        },
        default: {
          dataType: DataType.Boolean,
          description: "True when the photo is the default placeholder.",
        },
      },
      nullableProperties: ["metadata", "url"],
    },
    Relation: {
      dataType: DataType.Struct,
      description: "Relationship entry associated with the contact.",
      properties: {
        metadata: {
          dataType: null,
          ref: "FieldMetadata",
          description:
            "Metadata describing this relation entry. Null when unavailable.",
        },
        person: {
          dataType: DataType.String,
          description: "Name of the related person. Null when unavailable.",
        },
        type: {
          dataType: DataType.String,
          description:
            "Type of relationship (e.g. spouse). Null when unavailable.",
        },
      },
      nullableProperties: ["metadata", "person", "type"],
    },
    SipAddress: {
      dataType: DataType.Struct,
      description: "Session Initiation Protocol address for the contact.",
      properties: {
        metadata: {
          dataType: null,
          ref: "FieldMetadata",
          description:
            "Metadata describing this SIP address entry. Null when unavailable.",
        },
        value: {
          dataType: DataType.String,
          description: "SIP address value. Null when unavailable.",
        },
        type: {
          dataType: DataType.String,
          description: "Type of the SIP address. Null when unavailable.",
        },
      },
      nullableProperties: ["metadata", "value", "type"],
    },
    Url: {
      dataType: DataType.Struct,
      description: "URL entry associated with the contact.",
      properties: {
        metadata: {
          dataType: null,
          ref: "FieldMetadata",
          description:
            "Metadata describing this URL entry. Null when unavailable.",
        },
        value: {
          dataType: DataType.String,
          description: "URL string. Null when unavailable.",
        },
        type: {
          dataType: DataType.String,
          description: "Type label describing the URL. Null when unavailable.",
        },
        formattedType: {
          dataType: DataType.String,
          description:
            "Localized label for the URL type. Null when unavailable.",
        },
      },
      nullableProperties: ["metadata", "value", "type", "formattedType"],
    },
    UserDefinedField: {
      dataType: DataType.Struct,
      description: "Custom key/value data stored on the contact.",
      properties: {
        metadata: {
          dataType: null,
          ref: "FieldMetadata",
          description:
            "Metadata describing this user-defined field. Null when unavailable.",
        },
        key: {
          dataType: DataType.String,
          description: "Custom field key. Null when unavailable.",
        },
        value: {
          dataType: DataType.String,
          description: "Custom field value. Null when unavailable.",
        },
      },
      nullableProperties: ["metadata", "key", "value"],
    },
    Person: {
      dataType: DataType.Struct,
      description:
        "Complete contact record as returned by the Google People API connections endpoint.",
      properties: {
        resourceName: {
          dataType: DataType.String,
          description:
            "Resource name that uniquely identifies the contact (e.g. people/c123).",
        },
        etag: {
          dataType: DataType.String,
          description:
            "Etag for the contact used to detect version changes. Null when unavailable.",
        },
        metadata: {
          dataType: null,
          ref: "PersonMetadata",
          description:
            "Metadata describing the contact record. Null when unavailable.",
        },
        names: {
          dataType: DataType.List,
          description: "Collection of name representations for the contact.",
          items: {
            dataType: null,
            ref: "Name",
            description: "A single name entry for the contact.",
          },
        },
        emailAddresses: {
          dataType: DataType.List,
          description:
            "Collection of email addresses associated with the contact.",
          items: {
            dataType: null,
            ref: "EmailAddress",
            description: "Single email address entry.",
          },
        },
        phoneNumbers: {
          dataType: DataType.List,
          description:
            "Collection of phone numbers associated with the contact.",
          items: {
            dataType: null,
            ref: "PhoneNumber",
            description: "Single phone number entry.",
          },
        },
        addresses: {
          dataType: DataType.List,
          description: "Collection of postal addresses for the contact.",
          items: {
            dataType: null,
            ref: "Address",
            description: "Single postal address entry.",
          },
        },
        birthdays: {
          dataType: DataType.List,
          description: "Collection of birthday records for the contact.",
          items: {
            dataType: null,
            ref: "Birthday",
            description: "Single birthday entry.",
          },
        },
        events: {
          dataType: DataType.List,
          description: "Collection of important events known for the contact.",
          items: {
            dataType: null,
            ref: "Event",
            description: "Single event entry.",
          },
        },
        biographies: {
          dataType: DataType.List,
          description:
            "Collection of biography or note entries for the contact.",
          items: {
            dataType: null,
            ref: "Biography",
            description: "Single biography entry.",
          },
        },
        imClients: {
          dataType: DataType.List,
          description: "Collection of instant messaging identifiers.",
          items: {
            dataType: null,
            ref: "ImClient",
            description: "Single IM client entry.",
          },
        },
        interests: {
          dataType: DataType.List,
          description: "Collection of interests associated with the contact.",
          items: {
            dataType: null,
            ref: "Interest",
            description: "Single interest entry.",
          },
        },
        locations: {
          dataType: DataType.List,
          description: "Collection of location entries for the contact.",
          items: {
            dataType: null,
            ref: "Location",
            description: "Single location entry.",
          },
        },
        memberships: {
          dataType: DataType.List,
          description: "Collection of membership entries for the contact.",
          items: {
            dataType: null,
            ref: "Membership",
            description: "Single membership entry.",
          },
        },
        nicknames: {
          dataType: DataType.List,
          description: "Collection of nicknames for the contact.",
          items: {
            dataType: null,
            ref: "Nickname",
            description: "Single nickname entry.",
          },
        },
        occupations: {
          dataType: DataType.List,
          description: "Collection of occupation entries for the contact.",
          items: {
            dataType: null,
            ref: "Occupation",
            description: "Single occupation entry.",
          },
        },
        organizations: {
          dataType: DataType.List,
          description: "Collection of organization associations.",
          items: {
            dataType: null,
            ref: "Organization",
            description: "Single organization entry.",
          },
        },
        photos: {
          dataType: DataType.List,
          description: "Collection of photos associated with the contact.",
          items: {
            dataType: null,
            ref: "Photo",
            description: "Single photo entry.",
          },
        },
        relations: {
          dataType: DataType.List,
          description: "Collection of relationship entries.",
          items: {
            dataType: null,
            ref: "Relation",
            description: "Single relation entry.",
          },
        },
        sipAddresses: {
          dataType: DataType.List,
          description:
            "Collection of SIP addresses associated with the contact.",
          items: {
            dataType: null,
            ref: "SipAddress",
            description: "Single SIP address entry.",
          },
        },
        urls: {
          dataType: DataType.List,
          description: "Collection of URLs associated with the contact.",
          items: {
            dataType: null,
            ref: "Url",
            description: "Single URL entry.",
          },
        },
        userDefined: {
          dataType: DataType.List,
          description:
            "Collection of user-defined custom fields for the contact.",
          items: {
            dataType: null,
            ref: "UserDefinedField",
            description: "Single user-defined field entry.",
          },
        },
      },
      nullableProperties: ["etag", "metadata"],
    },
  },
  rootType: "Person",
} as const satisfies Schema;

import type { TypeOf } from "@superego/schema";
import type ContactSchema from "./ContactSchema.js";
import type {
  GoogleContactsAddress,
  GoogleContactsBiography,
  GoogleContactsBirthday,
  GoogleContactsDate,
  GoogleContactsEmailAddress,
  GoogleContactsEvent,
  GoogleContactsFieldMetadata,
  GoogleContactsImClient,
  GoogleContactsInterest,
  GoogleContactsLocation,
  GoogleContactsMembership,
  GoogleContactsName,
  GoogleContactsNickname,
  GoogleContactsOccupation,
  GoogleContactsOrganization,
  GoogleContactsPerson,
  GoogleContactsPersonMetadata,
  GoogleContactsPersonMetadataSource,
  GoogleContactsPhoneNumber,
  GoogleContactsPhoto,
  GoogleContactsRelation,
  GoogleContactsSipAddress,
  GoogleContactsUrl,
  GoogleContactsUserDefinedField,
} from "./types.js";

type Contact = TypeOf<typeof ContactSchema>;

export default function makeRemoteDocument(
  person: GoogleContactsPerson,
): Contact {
  return {
    resourceName: nonEmptyStringOr(person.resourceName, ""),
    etag: nonEmptyStringOr(person.etag, null),
    metadata:
      person.metadata !== undefined
        ? makePersonMetadata(person.metadata)
        : null,
    names: sanitizeArray(person.names, makeName),
    emailAddresses: sanitizeArray(person.emailAddresses, makeEmailAddress),
    phoneNumbers: sanitizeArray(person.phoneNumbers, makePhoneNumber),
    addresses: sanitizeArray(person.addresses, makeAddress),
    birthdays: sanitizeArray(person.birthdays, makeBirthday),
    events: sanitizeArray(person.events, makeEvent),
    biographies: sanitizeArray(person.biographies, makeBiography),
    imClients: sanitizeArray(person.imClients, makeImClient),
    interests: sanitizeArray(person.interests, makeInterest),
    locations: sanitizeArray(person.locations, makeLocation),
    memberships: sanitizeArray(person.memberships, makeMembership),
    nicknames: sanitizeArray(person.nicknames, makeNickname),
    occupations: sanitizeArray(person.occupations, makeOccupation),
    organizations: sanitizeArray(person.organizations, makeOrganization),
    photos: sanitizeArray(person.photos, makePhoto),
    relations: sanitizeArray(person.relations, makeRelation),
    sipAddresses: sanitizeArray(person.sipAddresses, makeSipAddress),
    urls: sanitizeArray(person.urls, makeUrl),
    userDefined: sanitizeArray(person.userDefined, makeUserDefinedField),
  };
}

function makePersonMetadata(
  metadata: GoogleContactsPersonMetadata,
): Contact["metadata"] {
  return {
    deleted: metadata.deleted === true,
    sources: sanitizeArray(metadata.sources, makePersonMetadataSource),
  };
}

function makePersonMetadataSource(
  source: GoogleContactsPersonMetadataSource,
): NonNullable<Contact["metadata"]>["sources"][number] {
  return {
    type: nonEmptyStringOr(source.type, null),
    id: nonEmptyStringOr(source.id, null),
    etag: nonEmptyStringOr(source.etag, null),
  };
}

function makeName(value: GoogleContactsName): Contact["names"][number] {
  return {
    metadata: makeFieldMetadata(value.metadata),
    displayName: nonEmptyStringOr(value.displayName, null),
    displayNameLastFirst: nonEmptyStringOr(value.displayNameLastFirst, null),
    givenName: nonEmptyStringOr(value.givenName, null),
    middleName: nonEmptyStringOr(value.middleName, null),
    familyName: nonEmptyStringOr(value.familyName, null),
    honorificPrefix: nonEmptyStringOr(value.honorificPrefix, null),
    honorificSuffix: nonEmptyStringOr(value.honorificSuffix, null),
    phoneticFullName: nonEmptyStringOr(value.phoneticFullName, null),
    phoneticGivenName: nonEmptyStringOr(value.phoneticGivenName, null),
    phoneticFamilyName: nonEmptyStringOr(value.phoneticFamilyName, null),
  };
}

function makeEmailAddress(
  value: GoogleContactsEmailAddress,
): Contact["emailAddresses"][number] {
  return {
    metadata: makeFieldMetadata(value.metadata),
    value: nonEmptyStringOr(value.value, null),
    type: nonEmptyStringOr(value.type, null),
    formattedType: nonEmptyStringOr(value.formattedType, null),
    displayName: nonEmptyStringOr(value.displayName, null),
  };
}

function makePhoneNumber(
  value: GoogleContactsPhoneNumber,
): Contact["phoneNumbers"][number] {
  return {
    metadata: makeFieldMetadata(value.metadata),
    value: nonEmptyStringOr(value.value, null),
    canonicalForm: nonEmptyStringOr(value.canonicalForm, null),
    type: nonEmptyStringOr(value.type, null),
    formattedType: nonEmptyStringOr(value.formattedType, null),
  };
}

function makeAddress(
  value: GoogleContactsAddress,
): Contact["addresses"][number] {
  return {
    metadata: makeFieldMetadata(value.metadata),
    formattedValue: nonEmptyStringOr(value.formattedValue, null),
    type: nonEmptyStringOr(value.type, null),
    formattedType: nonEmptyStringOr(value.formattedType, null),
    streetAddress: nonEmptyStringOr(value.streetAddress, null),
    poBox: nonEmptyStringOr(value.poBox, null),
    city: nonEmptyStringOr(value.city, null),
    region: nonEmptyStringOr(value.region, null),
    postalCode: nonEmptyStringOr(value.postalCode, null),
    country: nonEmptyStringOr(value.country, null),
    countryCode: nonEmptyStringOr(value.countryCode, null),
  };
}

function makeBiography(
  value: GoogleContactsBiography,
): Contact["biographies"][number] {
  return {
    metadata: makeFieldMetadata(value.metadata),
    value: nonEmptyStringOr(value.value, null),
    contentType: nonEmptyStringOr(value.contentType, null),
  };
}

function makeEvent(value: GoogleContactsEvent): Contact["events"][number] {
  return {
    metadata: makeFieldMetadata(value.metadata),
    type: nonEmptyStringOr(value.type, null),
    date: makeDate(value.date),
  };
}

function makeBirthday(
  value: GoogleContactsBirthday,
): Contact["birthdays"][number] {
  return {
    metadata: makeFieldMetadata(value.metadata),
    text: nonEmptyStringOr(value.text, null),
    date: makeDate(value.date),
  };
}

function makeImClient(
  value: GoogleContactsImClient,
): Contact["imClients"][number] {
  return {
    metadata: makeFieldMetadata(value.metadata),
    username: nonEmptyStringOr(value.username, null),
    protocol: nonEmptyStringOr(value.protocol, null),
    formattedProtocol: nonEmptyStringOr(value.formattedProtocol, null),
    type: nonEmptyStringOr(value.type, null),
    formattedType: nonEmptyStringOr(value.formattedType, null),
  };
}

function makeInterest(
  value: GoogleContactsInterest,
): Contact["interests"][number] {
  return {
    metadata: makeFieldMetadata(value.metadata),
    value: nonEmptyStringOr(value.value, null),
  };
}

function makeLocation(
  value: GoogleContactsLocation,
): Contact["locations"][number] {
  return {
    metadata: makeFieldMetadata(value.metadata),
    value: nonEmptyStringOr(value.value, null),
    type: nonEmptyStringOr(value.type, null),
    current: value.current === true,
  };
}

function makeMembership(
  value: GoogleContactsMembership,
): Contact["memberships"][number] {
  return {
    metadata: makeFieldMetadata(value.metadata),
    contactGroupMembership:
      value.contactGroupMembership !== undefined
        ? {
            contactGroupId: nonEmptyStringOr(
              value.contactGroupMembership.contactGroupId,
              null,
            ),
            contactGroupResourceName: nonEmptyStringOr(
              value.contactGroupMembership.contactGroupResourceName,
              null,
            ),
          }
        : null,
    domainMembership:
      value.domainMembership !== undefined
        ? { inViewerDomain: value.domainMembership.inViewerDomain === true }
        : null,
  };
}

function makeNickname(
  value: GoogleContactsNickname,
): Contact["nicknames"][number] {
  return {
    metadata: makeFieldMetadata(value.metadata),
    value: nonEmptyStringOr(value.value, null),
    type: nonEmptyStringOr(value.type, null),
  };
}

function makeOccupation(
  value: GoogleContactsOccupation,
): Contact["occupations"][number] {
  return {
    metadata: makeFieldMetadata(value.metadata),
    value: nonEmptyStringOr(value.value, null),
  };
}

function makeOrganization(
  value: GoogleContactsOrganization,
): Contact["organizations"][number] {
  return {
    metadata: makeFieldMetadata(value.metadata),
    name: nonEmptyStringOr(value.name, null),
    title: nonEmptyStringOr(value.title, null),
    department: nonEmptyStringOr(value.department, null),
    jobDescription: nonEmptyStringOr(value.jobDescription, null),
    symbol: nonEmptyStringOr(value.symbol, null),
    domain: nonEmptyStringOr(value.domain, null),
    startDate: makeDate(value.startDate),
    endDate: makeDate(value.endDate),
    current: value.current === true,
  };
}

function makePhoto(value: GoogleContactsPhoto): Contact["photos"][number] {
  return {
    metadata: makeFieldMetadata(value.metadata),
    url: nonEmptyStringOr(value.url, null),
    default: value.default === true,
  };
}

function makeRelation(
  value: GoogleContactsRelation,
): Contact["relations"][number] {
  return {
    metadata: makeFieldMetadata(value.metadata),
    person: nonEmptyStringOr(value.person, null),
    type: nonEmptyStringOr(value.type, null),
  };
}

function makeSipAddress(
  value: GoogleContactsSipAddress,
): Contact["sipAddresses"][number] {
  return {
    metadata: makeFieldMetadata(value.metadata),
    value: nonEmptyStringOr(value.value, null),
    type: nonEmptyStringOr(value.type, null),
  };
}

function makeUrl(value: GoogleContactsUrl): Contact["urls"][number] {
  return {
    metadata: makeFieldMetadata(value.metadata),
    value: nonEmptyStringOr(value.value, null),
    type: nonEmptyStringOr(value.type, null),
    formattedType: nonEmptyStringOr(value.formattedType, null),
  };
}

function makeUserDefinedField(
  value: GoogleContactsUserDefinedField,
): Contact["userDefined"][number] {
  return {
    metadata: makeFieldMetadata(value.metadata),
    key: nonEmptyStringOr(value.key, null),
    value: nonEmptyStringOr(value.value, null),
  };
}

function makeFieldMetadata(
  value: GoogleContactsFieldMetadata | undefined,
): Contact["names"][number]["metadata"] {
  if (value === undefined) {
    return null;
  }

  return {
    primary: value.primary === true,
    verified: value.verified === true,
    source: value.source !== undefined ? makeFieldSource(value.source) : null,
  };
}

function makeFieldSource(
  source: NonNullable<GoogleContactsFieldMetadata["source"]>,
): NonNullable<NonNullable<Contact["names"][number]["metadata"]>["source"]> {
  return {
    type: nonEmptyStringOr(source?.type, null),
    id: nonEmptyStringOr(source?.id, null),
    etag: nonEmptyStringOr(source?.etag, null),
  };
}

function makeDate(
  value: GoogleContactsDate | undefined,
): Contact["birthdays"][number]["date"] {
  if (value === undefined) {
    return null;
  }

  return {
    year: typeof value.year === "number" ? value.year : null,
    month: typeof value.month === "number" ? value.month : null,
    day: typeof value.day === "number" ? value.day : null,
  };
}

function sanitizeArray<Input, Output>(
  values: Input[] | undefined,
  mapper: (value: Input) => Output,
): Output[] {
  if (!Array.isArray(values)) {
    return [];
  }

  const mapped: Output[] = [];
  for (const value of values) {
    if (value === null || value === undefined) {
      continue;
    }
    mapped.push(mapper(value));
  }
  return mapped;
}

function nonEmptyStringOr<Fallback extends string | null>(
  value: unknown,
  fallback: Fallback,
): string | Fallback {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

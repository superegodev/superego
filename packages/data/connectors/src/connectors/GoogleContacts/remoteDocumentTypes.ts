// Extracted from
// https://github.com/googleapis/google-api-nodejs-client/blob/main/src/apis/people/v1.ts
//
// Manual adjustments:
//
// - Removed unnecessary types and classes, keeping only the types used to
//   define Person.
// - Removed the Schema$ prefix.
// - Transformed interfaces into types, to keep consistency with code generated
//   by codegen.

/**
 * A person's physical address. May be a P.O. box or street address. All fields are optional.
 */
export type Address = {
  /**
   * The city of the address.
   */
  city?: string | null;
  /**
   * The country of the address.
   */
  country?: string | null;
  /**
   * The [ISO 3166-1 alpha-2](http://www.iso.org/iso/country_codes.htm) country code of the address.
   */
  countryCode?: string | null;
  /**
   * The extended address of the address; for example, the apartment number.
   */
  extendedAddress?: string | null;
  /**
   * Output only. The type of the address translated and formatted in the viewer's account locale or the `Accept-Language` HTTP header locale.
   */
  formattedType?: string | null;
  /**
   * The unstructured value of the address. If this is not set by the user it will be automatically constructed from structured values.
   */
  formattedValue?: string | null;
  /**
   * Metadata about the address.
   */
  metadata?: FieldMetadata;
  /**
   * The P.O. box of the address.
   */
  poBox?: string | null;
  /**
   * The postal code of the address.
   */
  postalCode?: string | null;
  /**
   * The region of the address; for example, the state or province.
   */
  region?: string | null;
  /**
   * The street address.
   */
  streetAddress?: string | null;
  /**
   * The type of the address. The type can be custom or one of these predefined values: * `home` * `work` * `other`
   */
  type?: string | null;
};

/**
 * A person's age range.
 */
export type AgeRangeType = {
  /**
   * The age range.
   */
  ageRange?: string | null;
  /**
   * Metadata about the age range.
   */
  metadata?: FieldMetadata;
};

/**
 * A person's short biography.
 */
export type Biography = {
  /**
   * The content type of the biography.
   */
  contentType?: string | null;
  /**
   * Metadata about the biography.
   */
  metadata?: FieldMetadata;
  /**
   * The short biography.
   */
  value?: string | null;
};

/**
 * A person's birthday. At least one of the `date` and `text` fields are specified. The `date` and `text` fields typically represent the same date, but are not guaranteed to. Clients should always set the `date` field when mutating birthdays.
 */
export type Birthday = {
  /**
   * The structured date of the birthday.
   */
  date?: Date;
  /**
   * Metadata about the birthday.
   */
  metadata?: FieldMetadata;
  /**
   * Prefer to use the `date` field if set. A free-form string representing the user's birthday. This value is not validated.
   */
  text?: string | null;
};

/**
 * **DEPRECATED**: No data will be returned A person's bragging rights.
 */
export type BraggingRights = {
  /**
   * Metadata about the bragging rights.
   */
  metadata?: FieldMetadata;
  /**
   * The bragging rights; for example, `climbed mount everest`.
   */
  value?: string | null;
};

/**
 * A person's calendar URL.
 */
export type CalendarUrl = {
  /**
   * Output only. The type of the calendar URL translated and formatted in the viewer's account locale or the `Accept-Language` HTTP header locale.
   */
  formattedType?: string | null;
  /**
   * Metadata about the calendar URL.
   */
  metadata?: FieldMetadata;
  /**
   * The type of the calendar URL. The type can be custom or one of these predefined values: * `home` * `freeBusy` * `work`
   */
  type?: string | null;
  /**
   * The calendar URL.
   */
  url?: string | null;
};

/**
 * Arbitrary client data that is populated by clients. Duplicate keys and values are allowed.
 */
export type ClientData = {
  /**
   * The client specified key of the client data.
   */
  key?: string | null;
  /**
   * Metadata about the client data.
   */
  metadata?: FieldMetadata;
  /**
   * The client specified value of the client data.
   */
  value?: string | null;
};

/**
 * A Google contact group membership.
 */
export type ContactGroupMembership = {
  /**
   * Output only. The contact group ID for the contact group membership.
   */
  contactGroupId?: string | null;
  /**
   * The resource name for the contact group, assigned by the server. An ASCII string, in the form of `contactGroups/{contact_group_id\}`. Only contact_group_resource_name can be used for modifying memberships. Any contact group membership can be removed, but only user group or "myContacts" or "starred" system groups memberships can be added. A contact must always have at least one contact group membership.
   */
  contactGroupResourceName?: string | null;
};

/**
 * A person's cover photo. A large image shown on the person's profile page that represents who they are or what they care about.
 */
export type CoverPhoto = {
  /**
   * True if the cover photo is the default cover photo; false if the cover photo is a user-provided cover photo.
   */
  default?: boolean | null;
  /**
   * Metadata about the cover photo.
   */
  metadata?: FieldMetadata;
  /**
   * The URL of the cover photo.
   */
  url?: string | null;
};

/**
 * Represents a whole or partial calendar date, such as a birthday. The time of day and time zone are either specified elsewhere or are insignificant. The date is relative to the Gregorian Calendar. This can represent one of the following: * A full date, with non-zero year, month, and day values. * A month and day, with a zero year (for example, an anniversary). * A year on its own, with a zero month and a zero day. * A year and month, with a zero day (for example, a credit card expiration date). Related types: * google.type.TimeOfDay * google.type.DateTime * google.protobuf.Timestamp
 */
export type Date = {
  /**
   * Day of a month. Must be from 1 to 31 and valid for the year and month, or 0 to specify a year by itself or a year and month where the day isn't significant.
   */
  day?: number | null;
  /**
   * Month of a year. Must be from 1 to 12, or 0 to specify a year without a month and day.
   */
  month?: number | null;
  /**
   * Year of the date. Must be from 1 to 9999, or 0 to specify a date without a year.
   */
  year?: number | null;
};

/**
 * A Google Workspace Domain membership.
 */
export type DomainMembership = {
  /**
   * True if the person is in the viewer's Google Workspace domain.
   */
  inViewerDomain?: boolean | null;
};

/**
 * A person's email address.
 */
export type EmailAddress = {
  /**
   * The display name of the email.
   */
  displayName?: string | null;
  /**
   * Output only. The type of the email address translated and formatted in the viewer's account locale or the `Accept-Language` HTTP header locale.
   */
  formattedType?: string | null;
  /**
   * Metadata about the email address.
   */
  metadata?: FieldMetadata;
  /**
   * The type of the email address. The type can be custom or one of these predefined values: * `home` * `work` * `other`
   */
  type?: string | null;
  /**
   * The email address.
   */
  value?: string | null;
};

/**
 * A generic empty message that you can re-use to avoid defining duplicated empty messages in your APIs. A typical example is to use it as the request or the response type of an API method. For instance: service Foo { rpc Bar(google.protobuf.Empty) returns (google.protobuf.Empty); \}
 */
export type Empty = {};
/**
 * An event related to the person.
 */
export type Event = {
  /**
   * The date of the event.
   */
  date?: Date;
  /**
   * Output only. The type of the event translated and formatted in the viewer's account locale or the `Accept-Language` HTTP header locale.
   */
  formattedType?: string | null;
  /**
   * Metadata about the event.
   */
  metadata?: FieldMetadata;
  /**
   * The type of the event. The type can be custom or one of these predefined values: * `anniversary` * `other`
   */
  type?: string | null;
};

/**
 * An identifier from an external entity related to the person.
 */
export type ExternalId = {
  /**
   * Output only. The type of the event translated and formatted in the viewer's account locale or the `Accept-Language` HTTP header locale.
   */
  formattedType?: string | null;
  /**
   * Metadata about the external ID.
   */
  metadata?: FieldMetadata;
  /**
   * The type of the external ID. The type can be custom or one of these predefined values: * `account` * `customer` * `loginId` * `network` * `organization`
   */
  type?: string | null;
  /**
   * The value of the external ID.
   */
  value?: string | null;
};

/**
 * Metadata about a field.
 */
export type FieldMetadata = {
  /**
   * Output only. True if the field is the primary field for all sources in the person. Each person will have at most one field with `primary` set to true.
   */
  primary?: boolean | null;
  /**
   * The source of the field.
   */
  source?: Source;
  /**
   * True if the field is the primary field for the source. Each source must have at most one field with `source_primary` set to true.
   */
  sourcePrimary?: boolean | null;
  /**
   * Output only. True if the field is verified; false if the field is unverified. A verified field is typically a name, email address, phone number, or website that has been confirmed to be owned by the person.
   */
  verified?: boolean | null;
};

/**
 * The name that should be used to sort the person in a list.
 */
export type FileAs = {
  /**
   * Metadata about the file-as.
   */
  metadata?: FieldMetadata;
  /**
   * The file-as value
   */
  value?: string | null;
};

/**
 * A person's gender.
 */
export type Gender = {
  /**
   * Free form text field for pronouns that should be used to address the person. Common values are: * `he`/`him` * `she`/`her` * `they`/`them`
   */
  addressMeAs?: string | null;
  /**
   * Output only. The value of the gender translated and formatted in the viewer's account locale or the `Accept-Language` HTTP header locale. Unspecified or custom value are not localized.
   */
  formattedValue?: string | null;
  /**
   * Metadata about the gender.
   */
  metadata?: FieldMetadata;
  /**
   * The gender for the person. The gender can be custom or one of these predefined values: * `male` * `female` * `unspecified`
   */
  value?: string | null;
};

/**
 * A person's instant messaging client.
 */
export type ImClient = {
  /**
   * Output only. The protocol of the IM client formatted in the viewer's account locale or the `Accept-Language` HTTP header locale.
   */
  formattedProtocol?: string | null;
  /**
   * Output only. The type of the IM client translated and formatted in the viewer's account locale or the `Accept-Language` HTTP header locale.
   */
  formattedType?: string | null;
  /**
   * Metadata about the IM client.
   */
  metadata?: FieldMetadata;
  /**
   * The protocol of the IM client. The protocol can be custom or one of these predefined values: * `aim` * `msn` * `yahoo` * `skype` * `qq` * `googleTalk` * `icq` * `jabber` * `netMeeting`
   */
  protocol?: string | null;
  /**
   * The type of the IM client. The type can be custom or one of these predefined values: * `home` * `work` * `other`
   */
  type?: string | null;
  /**
   * The user name used in the IM client.
   */
  username?: string | null;
};

/**
 * One of the person's interests.
 */
export type Interest = {
  /**
   * Metadata about the interest.
   */
  metadata?: FieldMetadata;
  /**
   * The interest; for example, `stargazing`.
   */
  value?: string | null;
};

/**
 * A person's locale preference.
 */
export type Locale = {
  /**
   * Metadata about the locale.
   */
  metadata?: FieldMetadata;
  /**
   * The well-formed [IETF BCP 47](https://tools.ietf.org/html/bcp47) language tag representing the locale.
   */
  value?: string | null;
};

/**
 * A person's location.
 */
export type Location = {
  /**
   * The building identifier.
   */
  buildingId?: string | null;
  /**
   * Whether the location is the current location.
   */
  current?: boolean | null;
  /**
   * The individual desk location.
   */
  deskCode?: string | null;
  /**
   * The floor name or number.
   */
  floor?: string | null;
  /**
   * The floor section in `floor_name`.
   */
  floorSection?: string | null;
  /**
   * Metadata about the location.
   */
  metadata?: FieldMetadata;
  /**
   * The type of the location. The type can be custom or one of these predefined values: * `desk` * `grewUp`
   */
  type?: string | null;
  /**
   * The free-form value of the location.
   */
  value?: string | null;
};

/**
 * A person's membership in a group. Only contact group memberships can be modified.
 */
export type Membership = {
  /**
   * The contact group membership.
   */
  contactGroupMembership?: ContactGroupMembership;
  /**
   * Output only. The domain membership.
   */
  domainMembership?: DomainMembership;
  /**
   * Metadata about the membership.
   */
  metadata?: FieldMetadata;
};

/**
 * A person's miscellaneous keyword.
 */
export type MiscKeyword = {
  /**
   * Output only. The type of the miscellaneous keyword translated and formatted in the viewer's account locale or the `Accept-Language` HTTP header locale.
   */
  formattedType?: string | null;
  /**
   * Metadata about the miscellaneous keyword.
   */
  metadata?: FieldMetadata;
  /**
   * The miscellaneous keyword type.
   */
  type?: string | null;
  /**
   * The value of the miscellaneous keyword.
   */
  value?: string | null;
};

/**
 * A person's name. If the name is a mononym, the family name is empty.
 */
export type Name = {
  /**
   * Output only. The display name formatted according to the locale specified by the viewer's account or the `Accept-Language` HTTP header.
   */
  displayName?: string | null;
  /**
   * Output only. The display name with the last name first formatted according to the locale specified by the viewer's account or the `Accept-Language` HTTP header.
   */
  displayNameLastFirst?: string | null;
  /**
   * The family name.
   */
  familyName?: string | null;
  /**
   * The given name.
   */
  givenName?: string | null;
  /**
   * The honorific prefixes, such as `Mrs.` or `Dr.`
   */
  honorificPrefix?: string | null;
  /**
   * The honorific suffixes, such as `Jr.`
   */
  honorificSuffix?: string | null;
  /**
   * Metadata about the name.
   */
  metadata?: FieldMetadata;
  /**
   * The middle name(s).
   */
  middleName?: string | null;
  /**
   * The family name spelled as it sounds.
   */
  phoneticFamilyName?: string | null;
  /**
   * The full name spelled as it sounds.
   */
  phoneticFullName?: string | null;
  /**
   * The given name spelled as it sounds.
   */
  phoneticGivenName?: string | null;
  /**
   * The honorific prefixes spelled as they sound.
   */
  phoneticHonorificPrefix?: string | null;
  /**
   * The honorific suffixes spelled as they sound.
   */
  phoneticHonorificSuffix?: string | null;
  /**
   * The middle name(s) spelled as they sound.
   */
  phoneticMiddleName?: string | null;
  /**
   * The free form name value.
   */
  unstructuredName?: string | null;
};

/**
 * A person's nickname.
 */
export type Nickname = {
  /**
   * Metadata about the nickname.
   */
  metadata?: FieldMetadata;
  /**
   * The type of the nickname.
   */
  type?: string | null;
  /**
   * The nickname.
   */
  value?: string | null;
};

/**
 * A person's occupation.
 */
export type Occupation = {
  /**
   * Metadata about the occupation.
   */
  metadata?: FieldMetadata;
  /**
   * The occupation; for example, `carpenter`.
   */
  value?: string | null;
};

/**
 * A person's past or current organization. Overlapping date ranges are permitted.
 */
export type Organization = {
  /**
   * The person's cost center at the organization.
   */
  costCenter?: string | null;
  /**
   * True if the organization is the person's current organization; false if the organization is a past organization.
   */
  current?: boolean | null;
  /**
   * The person's department at the organization.
   */
  department?: string | null;
  /**
   * The domain name associated with the organization; for example, `google.com`.
   */
  domain?: string | null;
  /**
   * The end date when the person left the organization.
   */
  endDate?: Date;
  /**
   * Output only. The type of the organization translated and formatted in the viewer's account locale or the `Accept-Language` HTTP header locale.
   */
  formattedType?: string | null;
  /**
   * The person's full-time equivalent millipercent within the organization (100000 = 100%).
   */
  fullTimeEquivalentMillipercent?: number | null;
  /**
   * The person's job description at the organization.
   */
  jobDescription?: string | null;
  /**
   * The location of the organization office the person works at.
   */
  location?: string | null;
  /**
   * Metadata about the organization.
   */
  metadata?: FieldMetadata;
  /**
   * The name of the organization.
   */
  name?: string | null;
  /**
   * The phonetic name of the organization.
   */
  phoneticName?: string | null;
  /**
   * The start date when the person joined the organization.
   */
  startDate?: Date;
  /**
   * The symbol associated with the organization; for example, a stock ticker symbol, abbreviation, or acronym.
   */
  symbol?: string | null;
  /**
   * The person's job title at the organization.
   */
  title?: string | null;
  /**
   * The type of the organization. The type can be custom or one of these predefined values: * `work` * `school`
   */
  type?: string | null;
};

/**
 * Information about a person merged from various data sources such as the authenticated user's contacts and profile data. Most fields can have multiple items. The items in a field have no guaranteed order, but each non-empty field is guaranteed to have exactly one field with `metadata.primary` set to true.
 */
export type Person = {
  /**
   * The person's street addresses.
   */
  addresses?: Address[];
  /**
   * Output only. **DEPRECATED** (Please use `person.ageRanges` instead) The person's age range.
   */
  ageRange?: string | null;
  /**
   * Output only. The person's age ranges.
   */
  ageRanges?: AgeRangeType[];
  /**
   * The person's biographies. This field is a singleton for contact sources.
   */
  biographies?: Biography[];
  /**
   * The person's birthdays. This field is a singleton for contact sources.
   */
  birthdays?: Birthday[];
  /**
   * **DEPRECATED**: No data will be returned The person's bragging rights.
   */
  braggingRights?: BraggingRights[];
  /**
   * The person's calendar URLs.
   */
  calendarUrls?: CalendarUrl[];
  /**
   * The person's client data.
   */
  clientData?: ClientData[];
  /**
   * Output only. The person's cover photos.
   */
  coverPhotos?: CoverPhoto[];
  /**
   * The person's email addresses. For `people.connections.list` and `otherContacts.list` the number of email addresses is limited to 100. If a Person has more email addresses the entire set can be obtained by calling GetPeople.
   */
  emailAddresses?: EmailAddress[];
  /**
   * The [HTTP entity tag](https://en.wikipedia.org/wiki/HTTP_ETag) of the resource. Used for web cache validation.
   */
  etag?: string | null;
  /**
   * The person's events.
   */
  events?: Event[];
  /**
   * The person's external IDs.
   */
  externalIds?: ExternalId[];
  /**
   * The person's file-ases.
   */
  fileAses?: FileAs[];
  /**
   * The person's genders. This field is a singleton for contact sources.
   */
  genders?: Gender[];
  /**
   * The person's instant messaging clients.
   */
  imClients?: ImClient[];
  /**
   * The person's interests.
   */
  interests?: Interest[];
  /**
   * The person's locale preferences.
   */
  locales?: Locale[];
  /**
   * The person's locations.
   */
  locations?: Location[];
  /**
   * The person's group memberships.
   */
  memberships?: Membership[];
  /**
   * Output only. Metadata about the person.
   */
  metadata?: PersonMetadata;
  /**
   * The person's miscellaneous keywords.
   */
  miscKeywords?: MiscKeyword[];
  /**
   * The person's names. This field is a singleton for contact sources.
   */
  names?: Name[];
  /**
   * The person's nicknames.
   */
  nicknames?: Nickname[];
  /**
   * The person's occupations.
   */
  occupations?: Occupation[];
  /**
   * The person's past or current organizations.
   */
  organizations?: Organization[];
  /**
   * The person's phone numbers. For `people.connections.list` and `otherContacts.list` the number of phone numbers is limited to 100. If a Person has more phone numbers the entire set can be obtained by calling GetPeople.
   */
  phoneNumbers?: PhoneNumber[];
  /**
   * Output only. The person's photos.
   */
  photos?: Photo[];
  /**
   * The person's relations.
   */
  relations?: Relation[];
  /**
   * Output only. **DEPRECATED**: No data will be returned The person's relationship interests.
   */
  relationshipInterests?: RelationshipInterest[];
  /**
   * Output only. **DEPRECATED**: No data will be returned The person's relationship statuses.
   */
  relationshipStatuses?: RelationshipStatus[];
  /**
   * **DEPRECATED**: (Please use `person.locations` instead) The person's residences.
   */
  residences?: Residence[];
  /**
   * The resource name for the person, assigned by the server. An ASCII string in the form of `people/{person_id\}`.
   */
  resourceName?: string | null;
  /**
   * The person's SIP addresses.
   */
  sipAddresses?: SipAddress[];
  /**
   * The person's skills.
   */
  skills?: Skill[];
  /**
   * Output only. **DEPRECATED**: No data will be returned The person's taglines.
   */
  taglines?: Tagline[];
  /**
   * The person's associated URLs.
   */
  urls?: Url[];
  /**
   * The person's user defined data.
   */
  userDefined?: UserDefined[];
};

/**
 * The metadata about a person.
 */
export type PersonMetadata = {
  /**
   * Output only. True if the person resource has been deleted. Populated only for `people.connections.list` and `otherContacts.list` sync requests.
   */
  deleted?: boolean | null;
  /**
   * Output only. Resource names of people linked to this resource.
   */
  linkedPeopleResourceNames?: string[] | null;
  /**
   * Output only. **DEPRECATED** (Please use `person.metadata.sources.profileMetadata.objectType` instead) The type of the person object.
   */
  objectType?: string | null;
  /**
   * Output only. Any former resource names this person has had. Populated only for `people.connections.list` requests that include a sync token. The resource name may change when adding or removing fields that link a contact and profile such as a verified email, verified phone number, or profile URL.
   */
  previousResourceNames?: string[] | null;
  /**
   * The sources of data for the person.
   */
  sources?: Source[];
};

/**
 * A person's phone number.
 */
export type PhoneNumber = {
  /**
   * Output only. The canonicalized [ITU-T E.164](https://law.resource.org/pub/us/cfr/ibr/004/itu-t.E.164.1.2008.pdf) form of the phone number.
   */
  canonicalForm?: string | null;
  /**
   * Output only. The type of the phone number translated and formatted in the viewer's account locale or the `Accept-Language` HTTP header locale.
   */
  formattedType?: string | null;
  /**
   * Metadata about the phone number.
   */
  metadata?: FieldMetadata;
  /**
   * The type of the phone number. The type can be custom or one of these predefined values: * `home` * `work` * `mobile` * `homeFax` * `workFax` * `otherFax` * `pager` * `workMobile` * `workPager` * `main` * `googleVoice` * `other`
   */
  type?: string | null;
  /**
   * The phone number.
   */
  value?: string | null;
};

/**
 * A person's photo. A picture shown next to the person's name to help others recognize the person.
 */
export type Photo = {
  /**
   * True if the photo is a default photo; false if the photo is a user-provided photo.
   */
  default?: boolean | null;
  /**
   * Metadata about the photo.
   */
  metadata?: FieldMetadata;
  /**
   * The URL of the photo. You can change the desired size by appending a query parameter `sz={size\}` at the end of the url, where {size\} is the size in pixels. Example: https://lh3.googleusercontent.com/-T_wVWLlmg7w/AAAAAAAAAAI/AAAAAAAABa8/00gzXvDBYqw/s100/photo.jpg?sz=50
   */
  url?: string | null;
};

/**
 * The metadata about a profile.
 */
export type ProfileMetadata = {
  /**
   * Output only. The profile object type.
   */
  objectType?: string | null;
  /**
   * Output only. The user types.
   */
  userTypes?: string[] | null;
};

/**
 * A person's relation to another person.
 */
export type Relation = {
  /**
   * Output only. The type of the relation translated and formatted in the viewer's account locale or the locale specified in the Accept-Language HTTP header.
   */
  formattedType?: string | null;
  /**
   * Metadata about the relation.
   */
  metadata?: FieldMetadata;
  /**
   * The name of the other person this relation refers to.
   */
  person?: string | null;
  /**
   * The person's relation to the other person. The type can be custom or one of these predefined values: * `spouse` * `child` * `mother` * `father` * `parent` * `brother` * `sister` * `friend` * `relative` * `domesticPartner` * `manager` * `assistant` * `referredBy` * `partner`
   */
  type?: string | null;
};

/**
 * **DEPRECATED**: No data will be returned A person's relationship interest .
 */
export type RelationshipInterest = {
  /**
   * Output only. The value of the relationship interest translated and formatted in the viewer's account locale or the locale specified in the Accept-Language HTTP header.
   */
  formattedValue?: string | null;
  /**
   * Metadata about the relationship interest.
   */
  metadata?: FieldMetadata;
  /**
   * The kind of relationship the person is looking for. The value can be custom or one of these predefined values: * `friend` * `date` * `relationship` * `networking`
   */
  value?: string | null;
};

/**
 * **DEPRECATED**: No data will be returned A person's relationship status.
 */
export type RelationshipStatus = {
  /**
   * Output only. The value of the relationship status translated and formatted in the viewer's account locale or the `Accept-Language` HTTP header locale.
   */
  formattedValue?: string | null;
  /**
   * Metadata about the relationship status.
   */
  metadata?: FieldMetadata;
  /**
   * The relationship status. The value can be custom or one of these predefined values: * `single` * `inARelationship` * `engaged` * `married` * `itsComplicated` * `openRelationship` * `widowed` * `inDomesticPartnership` * `inCivilUnion`
   */
  value?: string | null;
};

/**
 * **DEPRECATED**: Please use `person.locations` instead. A person's past or current residence.
 */
export type Residence = {
  /**
   * True if the residence is the person's current residence; false if the residence is a past residence.
   */
  current?: boolean | null;
  /**
   * Metadata about the residence.
   */
  metadata?: FieldMetadata;
  /**
   * The address of the residence.
   */
  value?: string | null;
};

/**
 * A person's SIP address. Session Initial Protocol addresses are used for VoIP communications to make voice or video calls over the internet.
 */
export type SipAddress = {
  /**
   * Output only. The type of the SIP address translated and formatted in the viewer's account locale or the `Accept-Language` HTTP header locale.
   */
  formattedType?: string | null;
  /**
   * Metadata about the SIP address.
   */
  metadata?: FieldMetadata;
  /**
   * The type of the SIP address. The type can be custom or or one of these predefined values: * `home` * `work` * `mobile` * `other`
   */
  type?: string | null;
  /**
   * The SIP address in the [RFC 3261 19.1](https://tools.ietf.org/html/rfc3261#section-19.1) SIP URI format.
   */
  value?: string | null;
};

/**
 * A skill that the person has.
 */
export type Skill = {
  /**
   * Metadata about the skill.
   */
  metadata?: FieldMetadata;
  /**
   * The skill; for example, `underwater basket weaving`.
   */
  value?: string | null;
};

/**
 * The source of a field.
 */
export type Source = {
  /**
   * **Only populated in `person.metadata.sources`.** The [HTTP entity tag](https://en.wikipedia.org/wiki/HTTP_ETag) of the source. Used for web cache validation.
   */
  etag?: string | null;
  /**
   * The unique identifier within the source type generated by the server.
   */
  id?: string | null;
  /**
   * Output only. **Only populated in `person.metadata.sources`.** Metadata about a source of type PROFILE.
   */
  profileMetadata?: ProfileMetadata;
  /**
   * The source type.
   */
  type?: string | null;
  /**
   * Output only. **Only populated in `person.metadata.sources`.** Last update timestamp of this source.
   */
  updateTime?: string | null;
};

/**
 * **DEPRECATED**: No data will be returned A brief one-line description of the person.
 */
export type Tagline = {
  /**
   * Metadata about the tagline.
   */
  metadata?: FieldMetadata;
  /**
   * The tagline.
   */
  value?: string | null;
};

/**
 * A person's associated URLs.
 */
export type Url = {
  /**
   * Output only. The type of the URL translated and formatted in the viewer's account locale or the `Accept-Language` HTTP header locale.
   */
  formattedType?: string | null;
  /**
   * Metadata about the URL.
   */
  metadata?: FieldMetadata;
  /**
   * The type of the URL. The type can be custom or one of these predefined values: * `home` * `work` * `blog` * `profile` * `homePage` * `ftp` * `reservations` * `appInstallPage`: website for a Currents application. * `other`
   */
  type?: string | null;
  /**
   * The URL.
   */
  value?: string | null;
};

/**
 * Arbitrary user data that is populated by the end users.
 */
export type UserDefined = {
  /**
   * The end user specified key of the user defined data.
   */
  key?: string | null;
  /**
   * Metadata about the user defined data.
   */
  metadata?: FieldMetadata;
  /**
   * The end user specified value of the user defined data.
   */
  value?: string | null;
};

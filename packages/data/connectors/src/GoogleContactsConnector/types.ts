export interface GoogleContactsSource {
  type?: string;
  id?: string;
  etag?: string;
}

export interface GoogleContactsFieldMetadata {
  primary?: boolean;
  verified?: boolean;
  source?: GoogleContactsSource;
}

export interface GoogleContactsPersonMetadataSource
  extends GoogleContactsSource {
  type?: string;
  id?: string;
  etag?: string;
}

export interface GoogleContactsPersonMetadata {
  deleted?: boolean;
  sources?: GoogleContactsPersonMetadataSource[];
}

export interface GoogleContactsDate {
  year?: number;
  month?: number;
  day?: number;
}

export interface GoogleContactsBirthday {
  metadata?: GoogleContactsFieldMetadata;
  text?: string;
  date?: GoogleContactsDate;
}

export interface GoogleContactsEvent {
  metadata?: GoogleContactsFieldMetadata;
  type?: string;
  date?: GoogleContactsDate;
}

export interface GoogleContactsName {
  metadata?: GoogleContactsFieldMetadata;
  displayName?: string;
  displayNameLastFirst?: string;
  givenName?: string;
  middleName?: string;
  familyName?: string;
  honorificPrefix?: string;
  honorificSuffix?: string;
  phoneticFullName?: string;
  phoneticGivenName?: string;
  phoneticFamilyName?: string;
}

export interface GoogleContactsEmailAddress {
  metadata?: GoogleContactsFieldMetadata;
  value?: string;
  type?: string;
  displayName?: string;
  formattedType?: string;
}

export interface GoogleContactsPhoneNumber {
  metadata?: GoogleContactsFieldMetadata;
  value?: string;
  canonicalForm?: string;
  type?: string;
  formattedType?: string;
}

export interface GoogleContactsAddress {
  metadata?: GoogleContactsFieldMetadata;
  formattedValue?: string;
  type?: string;
  formattedType?: string;
  streetAddress?: string;
  poBox?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  countryCode?: string;
}

export interface GoogleContactsBiography {
  metadata?: GoogleContactsFieldMetadata;
  value?: string;
  contentType?: string;
}

export interface GoogleContactsImClient {
  metadata?: GoogleContactsFieldMetadata;
  username?: string;
  protocol?: string;
  formattedProtocol?: string;
  type?: string;
  formattedType?: string;
}

export interface GoogleContactsInterest {
  metadata?: GoogleContactsFieldMetadata;
  value?: string;
}

export interface GoogleContactsLocation {
  metadata?: GoogleContactsFieldMetadata;
  value?: string;
  type?: string;
  current?: boolean;
}

export interface GoogleContactsMembership {
  metadata?: GoogleContactsFieldMetadata;
  contactGroupMembership?: {
    contactGroupId?: string;
    contactGroupResourceName?: string;
  };
  domainMembership?: {
    inViewerDomain?: boolean;
  };
}

export interface GoogleContactsNickname {
  metadata?: GoogleContactsFieldMetadata;
  value?: string;
  type?: string;
}

export interface GoogleContactsOccupation {
  metadata?: GoogleContactsFieldMetadata;
  value?: string;
}

export interface GoogleContactsOrganization {
  metadata?: GoogleContactsFieldMetadata;
  name?: string;
  title?: string;
  department?: string;
  jobDescription?: string;
  symbol?: string;
  domain?: string;
  startDate?: GoogleContactsDate;
  endDate?: GoogleContactsDate;
  current?: boolean;
}

export interface GoogleContactsPhoto {
  metadata?: GoogleContactsFieldMetadata;
  url?: string;
  default?: boolean;
}

export interface GoogleContactsRelation {
  metadata?: GoogleContactsFieldMetadata;
  person?: string;
  type?: string;
}

export interface GoogleContactsSipAddress {
  metadata?: GoogleContactsFieldMetadata;
  value?: string;
  type?: string;
}

export interface GoogleContactsUrl {
  metadata?: GoogleContactsFieldMetadata;
  value?: string;
  type?: string;
  formattedType?: string;
}

export interface GoogleContactsUserDefinedField {
  metadata?: GoogleContactsFieldMetadata;
  key?: string;
  value?: string;
}

export interface GoogleContactsPerson {
  resourceName?: string;
  etag?: string;
  metadata?: GoogleContactsPersonMetadata;
  names?: GoogleContactsName[];
  emailAddresses?: GoogleContactsEmailAddress[];
  phoneNumbers?: GoogleContactsPhoneNumber[];
  addresses?: GoogleContactsAddress[];
  birthdays?: GoogleContactsBirthday[];
  events?: GoogleContactsEvent[];
  biographies?: GoogleContactsBiography[];
  imClients?: GoogleContactsImClient[];
  interests?: GoogleContactsInterest[];
  locations?: GoogleContactsLocation[];
  memberships?: GoogleContactsMembership[];
  nicknames?: GoogleContactsNickname[];
  occupations?: GoogleContactsOccupation[];
  organizations?: GoogleContactsOrganization[];
  photos?: GoogleContactsPhoto[];
  relations?: GoogleContactsRelation[];
  sipAddresses?: GoogleContactsSipAddress[];
  urls?: GoogleContactsUrl[];
  userDefined?: GoogleContactsUserDefinedField[];
}

export interface GoogleContactsConnectionsResponse {
  connections?: GoogleContactsPerson[];
  nextPageToken?: string;
  nextSyncToken?: string;
}

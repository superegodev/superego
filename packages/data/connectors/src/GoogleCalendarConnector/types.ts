export interface GoogleCalendarEventDateTime {
  date?: string;
  dateTime?: string;
  timeZone?: string;
}

export interface GoogleCalendarEventPerson {
  id?: string;
  email?: string;
  displayName?: string;
  self?: boolean;
}

export interface GoogleCalendarEventAttendee extends GoogleCalendarEventPerson {
  organizer?: boolean;
  resource?: boolean;
  optional?: boolean;
  responseStatus?: string;
  comment?: string;
  additionalGuests?: number;
}

export interface GoogleCalendarEventReminderOverride {
  method?: string;
  minutes?: number;
}

export interface GoogleCalendarEventReminders {
  useDefault?: boolean;
  overrides?: GoogleCalendarEventReminderOverride[];
}

export interface GoogleCalendarEventExtendedProperties {
  private?: Record<string, unknown>;
  shared?: Record<string, unknown>;
}

export interface GoogleCalendarEventSource {
  url?: string;
  title?: string;
}

export interface GoogleCalendarEventAttachment {
  fileUrl?: string;
  title?: string;
  mimeType?: string;
  iconLink?: string;
  fileId?: string;
}

export interface GoogleCalendarEvent {
  kind?: string;
  etag?: string;
  id?: string;
  status?: string;
  htmlLink?: string;
  created?: string;
  updated?: string;
  summary?: string;
  description?: string;
  location?: string;
  colorId?: string;
  creator?: GoogleCalendarEventPerson;
  organizer?: GoogleCalendarEventPerson;
  start?: GoogleCalendarEventDateTime;
  end?: GoogleCalendarEventDateTime;
  endTimeUnspecified?: boolean;
  recurrence?: string[];
  recurringEventId?: string;
  originalStartTime?: GoogleCalendarEventDateTime;
  transparency?: string;
  visibility?: string;
  iCalUID?: string;
  sequence?: number;
  attendees?: GoogleCalendarEventAttendee[];
  attendeesOmitted?: boolean;
  extendedProperties?: GoogleCalendarEventExtendedProperties;
  hangoutLink?: string;
  conferenceData?: Record<string, unknown>;
  gadget?: Record<string, unknown>;
  anyoneCanAddSelf?: boolean;
  guestsCanInviteOthers?: boolean;
  guestsCanModify?: boolean;
  guestsCanSeeOtherGuests?: boolean;
  privateCopy?: boolean;
  locked?: boolean;
  reminders?: GoogleCalendarEventReminders;
  source?: GoogleCalendarEventSource;
  attachments?: GoogleCalendarEventAttachment[];
  eventType?: string;
}

export interface GoogleCalendarEventsResponse {
  items?: GoogleCalendarEvent[];
  nextPageToken?: string;
  nextSyncToken?: string;
}

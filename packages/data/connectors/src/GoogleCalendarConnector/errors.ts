export class GoogleCalendarAccessTokenExpiredError extends Error {
  override name = "GoogleCalendarAccessTokenExpiredError";
  constructor() {
    super("Google Calendar access token expired");
  }
}

export class GoogleCalendarSyncTokenExpiredError extends Error {
  override name = "GoogleCalendarSyncTokenExpiredError";
  constructor() {
    super("Google Calendar sync token expired");
  }
}

export class GoogleCalendarAuthenticationFailedError extends Error {
  override name = "GoogleCalendarAuthenticationFailedError";
  constructor(readonly reason: string) {
    super(`Google Calendar authentication failed: ${reason}`);
  }
}

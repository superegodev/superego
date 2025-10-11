export class GoogleContactsAccessTokenExpiredError extends Error {
  override name = "GoogleContactsAccessTokenExpiredError";
  constructor() {
    super("Google Contacts access token expired");
  }
}

export class GoogleContactsSyncTokenExpiredError extends Error {
  override name = "GoogleContactsSyncTokenExpiredError";
  constructor() {
    super("Google Contacts sync token expired");
  }
}

export class GoogleContactsAuthenticationFailedError extends Error {
  override name = "GoogleContactsAuthenticationFailedError";
  constructor(readonly reason: string) {
    super(`Google Contacts authentication failed: ${reason}`);
  }
}

export class StravaAccessTokenExpiredError extends Error {
  override name = "StravaAccessTokenExpiredError";
  constructor() {
    super("Strava access token expired");
  }
}

export class StravaAuthenticationFailedError extends Error {
  override name = "StravaAuthenticationFailedError";
  constructor(readonly reason: string) {
    super(`Strava authentication failed: ${reason}`);
  }
}

export class StravaRateLimitedError extends Error {
  override name = "StravaRateLimitedError";
  constructor(readonly retryAfterSeconds: number | null) {
    super("Strava API rate limit exceeded");
  }
}

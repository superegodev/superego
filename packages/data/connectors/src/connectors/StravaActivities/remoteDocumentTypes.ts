// Generated with:
//
// ```sh
// swagger-codegen generate \
//   -i https://developers.strava.com/swagger/swagger.json \
//   -l typescript-fetch \
//   -o generated/typescript
// ```
//
// Manual adjustments:
//
// - Removed unnecessary types and classes, keeping only the types used to
//   define DetailedActivity.
// - Transformed enums into union of string literals, since enums cannot be used
//   in the JavascriptSandbox.
// - Transformed interfaces into types, to keep consistency with code generated
//   by codegen.
// - Cleaned up comments and other misc things.

/**
 * An enumeration of the types an activity may have. Note that this enumeration
 * does not include new sport types (e.g. MountainBikeRide, EMountainBikeRide),
 * activities with these sport types will have the corresponding activity type
 * (e.g. Ride for MountainBikeRide, EBikeRide for EMountainBikeRide).
 */
export type ActivityType =
  | "AlpineSki"
  | "BackcountrySki"
  | "Canoeing"
  | "Crossfit"
  | "EBikeRide"
  | "Elliptical"
  | "Golf"
  | "Handcycle"
  | "Hike"
  | "IceSkate"
  | "InlineSkate"
  | "Kayaking"
  | "Kitesurf"
  | "NordicSki"
  | "Ride"
  | "RockClimbing"
  | "RollerSki"
  | "Rowing"
  | "Run"
  | "Sail"
  | "Skateboard"
  | "Snowboard"
  | "Snowshoe"
  | "Soccer"
  | "StairStepper"
  | "StandUpPaddling"
  | "Surfing"
  | "Swim"
  | "Velomobile"
  | "VirtualRide"
  | "VirtualRun"
  | "Walk"
  | "WeightTraining"
  | "Wheelchair"
  | "Windsurf"
  | "Workout"
  | "Yoga";

export type DetailedActivity = SummaryActivity & {
  /** The description of the activity. */
  description?: string;
  photos?: PhotosSummary;
  gear?: SummaryGear;
  /** The number of kilocalories consumed during this activity. */
  calories?: number;
  segmentEfforts?: Array<DetailedSegmentEffort>;
  /** The name of the device used to record the activity. */
  deviceName?: string;
  /** The token used to embed a Strava activity. */
  embedToken?: string;
  /** The splits of this activity in metric units (for runs). */
  splitsMetric?: Array<Split>;
  /** The splits of this activity in imperial units (for runs). */
  splitsStandard?: Array<Split>;
  laps?: Array<Lap>;
  bestEfforts?: Array<DetailedSegmentEffort>;
};

export type DetailedSegmentEffort = SummarySegmentEffort & {
  /** The name of the segment on which this effort was performed. */
  name?: string;
  activity?: MetaActivity;
  athlete?: MetaAthlete;
  /** The effort's moving time. */
  movingTime?: number;
  /** The start index of this effort in its activity's stream. */
  startIndex?: number;
  /** The end index of this effort in its activity's stream. */
  endIndex?: number;
  /** The effort's average cadence. */
  averageCadence?: number;
  /** The average wattage of this effort. */
  averageWatts?: number;
  /**
   * For riding efforts, whether the wattage was reported by a dedicated
   * recording device.
   */
  deviceWatts?: boolean;
  /** The heart heart rate of the athlete during this effort. */
  averageHeartrate?: number;
  /** The maximum heart rate of the athlete during this effort. */
  maxHeartrate?: number;
  segment?: SummarySegment;
  /**
   * The rank of the effort on the global leaderboard if it belongs in the top
   * 10 at the time of upload.
   */
  komRank?: number;
  /**
   * The rank of the effort on the athlete's leaderboard if it belongs in the
   * top 3 at the time of upload.
   */
  prRank?: number;
  /** Whether this effort should be hidden when viewed within an activity. */
  hidden?: boolean;
};

export type Lap = {
  /** The unique identifier of this lap. */
  id?: number;
  activity?: MetaActivity;
  athlete?: MetaAthlete;
  /** The lap's average cadence. */
  averageCadence?: number;
  /** The lap's average speed. */
  averageSpeed?: number;
  /** The lap's distance, in meters. */
  distance?: number;
  /** The lap's elapsed time, in seconds. */
  elapsedTime?: number;
  /** The start index of this effort in its activity's stream. */
  startIndex?: number;
  /** The end index of this effort in its activity's stream. */
  endIndex?: number;
  /** The index of this lap in the activity it belongs to. */
  lapIndex?: number;
  /** The maximum speed of this lat, in meters per second. */
  maxSpeed?: number;
  /** The lap's moving time, in seconds. */
  movingTime?: number;
  /** The name of the lap. */
  name?: string;
  /** The athlete's pace zone during this lap. */
  paceZone?: number;
  split?: number;
  /** The time at which the lap was started. */
  startDate?: Date;
  /** The time at which the lap was started in the local timezone. */
  startDateLocal?: Date;
  /** The elevation gain of this lap, in meters. */
  totalElevationGain?: number;
};

/**
 * A pair of latitude/longitude coordinates, represented as an array of 2
 * floating point numbers.
 */
export type LatLng = number[];

export type MetaActivity = {
  /** The unique identifier of the activity. */
  id?: number;
};

export type MetaAthlete = {
  /** The unique identifier of the athlete. */
  id?: number;
};

export type PhotosSummary = {
  /** The number of photos. */
  count?: number;
  primary?: PhotosSummaryPrimary;
};

export type PhotosSummaryPrimary = {
  id?: number;
  source?: number;
  uniqueId?: string;
  urls?: { [key: string]: string };
};

export type PolylineMap = {
  /** The identifier of the map. */
  id?: string;
  /** The polyline of the map, only returned on detailed representation of an object. */
  polyline?: string;
  /** The summary polyline of the map. */
  summaryPolyline?: string;
};

export type Split = {
  /** The average speed of this split, in meters per second. */
  averageSpeed?: number;
  /** The distance of this split, in meters. */
  distance?: number;
  /** The elapsed time of this split, in seconds. */
  elapsedTime?: number;
  /** The elevation difference of this split, in meters. */
  elevationDifference?: number;
  /** The pacing zone of this split. */
  paceZone?: number;
  /** The moving time of this split, in seconds. */
  movingTime?: number;
  /** N/A. */
  split?: number;
};

/**
 * An enumeration of the sport types an activity may have. Distinct from
 * ActivityType in that it has new types (e.g. MountainBikeRide).
 */
export type SportType =
  | "AlpineSki"
  | "BackcountrySki"
  | "Badminton"
  | "Canoeing"
  | "Crossfit"
  | "EBikeRide"
  | "Elliptical"
  | "EMountainBikeRide"
  | "Golf"
  | "GravelRide"
  | "Handcycle"
  | "HighIntensityIntervalTraining"
  | "Hike"
  | "IceSkate"
  | "InlineSkate"
  | "Kayaking"
  | "Kitesurf"
  | "MountainBikeRide"
  | "NordicSki"
  | "Pickleball"
  | "Pilates"
  | "Racquetball"
  | "Ride"
  | "RockClimbing"
  | "RollerSki"
  | "Rowing"
  | "Run"
  | "Sail"
  | "Skateboard"
  | "Snowboard"
  | "Snowshoe"
  | "Soccer"
  | "Squash"
  | "StairStepper"
  | "StandUpPaddling"
  | "Surfing"
  | "Swim"
  | "TableTennis"
  | "Tennis"
  | "TrailRun"
  | "Velomobile"
  | "VirtualRide"
  | "VirtualRow"
  | "VirtualRun"
  | "Walk"
  | "WeightTraining"
  | "Wheelchair"
  | "Windsurf"
  | "Workout"
  | "Yoga";

export type SummaryActivity = MetaActivity & {
  /** The identifier provided at upload time. */
  externalId?: string;
  /** The identifier of the upload that resulted in this activity. */
  uploadId?: number;
  athlete?: MetaAthlete;
  /** The name of the activity. */
  name?: string;
  /** The activity's distance, in meters. */
  distance?: number;
  /** The activity's moving time, in seconds. */
  movingTime?: number;
  /** The activity's elapsed time, in seconds. */
  elapsedTime?: number;
  /** The activity's total elevation gain. */
  totalElevationGain?: number;
  /** The activity's highest elevation, in meters. */
  elevHigh?: number;
  /** The activity's lowest elevation, in meters. */
  elevLow?: number;
  /** Deprecated. Prefer to use sport_type. */
  type?: ActivityType;
  sportType?: SportType;
  /** The time at which the activity was started. */
  startDate?: Date;
  /** The time at which the activity was started in the local timezone. */
  startDateLocal?: Date;
  /** The timezone of the activity. */
  timezone?: string;
  startLatlng?: LatLng;
  endLatlng?: LatLng;
  /** The number of achievements gained during this activity. */
  achievementCount?: number;
  /** The number of kudos given for this activity. */
  kudosCount?: number;
  /** The number of comments for this activity. */
  commentCount?: number;
  /** The number of athletes for taking part in a group activity. */
  athleteCount?: number;
  /** The number of Instagram photos for this activity. */
  photoCount?: number;
  /** The number of Instagram and Strava photos for this activity. */
  totalPhotoCount?: number;
  map?: PolylineMap;
  /** Whether this activity was recorded on a training machine. */
  trainer?: boolean;
  /** Whether this activity is a commute. */
  commute?: boolean;
  /** Whether this activity was created manually. */
  manual?: boolean;
  /** Whether this activity is private. */
  _private?: boolean;
  /** Whether this activity is flagged. */
  flagged?: boolean;
  /** The activity's workout type. */
  workoutType?: number;
  /** The unique identifier of the upload in string format. */
  uploadIdStr?: string;
  /** The activity's average speed, in meters per second. */
  averageSpeed?: number;
  /** The activity's max speed, in meters per second. */
  maxSpeed?: number;
  /** Whether the logged-in athlete has kudoed this activity. */
  hasKudoed?: boolean;
  /** Whether the activity is muted. */
  hideFromHome?: boolean;
  /** The id of the gear for the activity. */
  gearId?: string;
  /** The total work done in kilojoules during this activity. Rides only. */
  kilojoules?: number;
  /** Average power output in watts during this activity. Rides only. */
  averageWatts?: number;
  /** Whether the watts are from a power meter, false if estimated. */
  deviceWatts?: boolean;
  /** Rides with power meter data only. */
  maxWatts?: number;
  /** Similar to Normalized Power. Rides with power meter data only. */
  weightedAverageWatts?: number;
};

export type SummaryGear = {
  /** The gear's unique identifier. */
  id?: string;
  /**
   * Resource state, indicates level of detail. Possible values: 2 -> "summary",
   * 3 -> "detail".
   */
  resourceState?: number;
  /** Whether this gear's is the owner's default one. */
  primary?: boolean;
  /** The gear's name. */
  name?: string;
  /** The distance logged with this gear. */
  distance?: number;
};

export type SummaryPRSegmentEffort = {
  /** The unique identifier of the activity related to the PR effort. */
  prActivityId?: number;
  /** The elapsed time ot the PR effort. */
  prElapsedTime?: number;
  /** The time at which the PR effort was started. */
  prDate?: Date;
  /** Number of efforts by the authenticated athlete on this segment. */
  effortCount?: number;
};

export type SummarySegment = {
  /** The unique identifier of this segment. */
  id?: number;
  /** The name of this segment. */
  name?: string;
  activityType?: "Ride" | "Run";
  /** The segment's distance, in meters. */
  distance?: number;
  /** The segment's average grade, in percents. */
  averageGrade?: number;
  /** The segments's maximum grade, in percents. */
  maximumGrade?: number;
  /** The segments's highest elevation, in meters. */
  elevationHigh?: number;
  /** The segments's lowest elevation, in meters. */
  elevationLow?: number;
  startLatlng?: LatLng;
  endLatlng?: LatLng;
  /**
   * The category of the climb [0, 5]. Higher is harder ie. 5 is Hors catégorie,
   * 0 is uncategorized in climb_category.
   */
  climbCategory?: number;
  /** The segments's city. */
  city?: string;
  /** The segments's state or geographical region. */
  state?: string;
  /** The segment's country. */
  country?: string;
  /** Whether this segment is private. */
  _private?: boolean;
  athletePrEffort?: SummaryPRSegmentEffort;
  athleteSegmentStats?: SummarySegmentEffort;
};

export type SummarySegmentEffort = {
  /** The unique identifier of this effort. */
  id?: number;
  /** The unique identifier of the activity related to this effort. */
  activityId?: number;
  /** The effort's elapsed time. */
  elapsedTime?: number;
  /** The time at which the effort was started. */
  startDate?: Date;
  /** The time at which the effort was started in the local timezone. */
  startDateLocal?: Date;
  /** The effort's distance in meters. */
  distance?: number;
  /** Whether this effort is the current best on the leaderboard. */
  isKom?: boolean;
};

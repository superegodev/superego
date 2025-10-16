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
// - Transformed camelCased props into snake_case (as the API returns them).
// - Transformed enums into union of string literals, since enums cannot be used
//   in the JavascriptSandbox.
// - Transformed Dates into strings.
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

export type PolylineMap = {
  /** The identifier of the map. */
  id?: string;
  /** The polyline of the map, only returned on detailed representation of an object. */
  polyline?: string;
  /** The summary polyline of the map. */
  summary_polyline?: string | null;
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
  external_id?: string;
  /** The identifier of the upload that resulted in this activity. */
  upload_id?: number;
  athlete?: MetaAthlete;
  /** The name of the activity. */
  name?: string;
  /** The activity's distance, in meters. */
  distance?: number;
  /** The activity's moving time, in seconds. */
  moving_time?: number;
  /** The activity's elapsed time, in seconds. */
  elapsed_time?: number;
  /** The activity's total elevation gain. */
  total_elevation_gain?: number;
  /** The activity's highest elevation, in meters. */
  elev_high?: number;
  /** The activity's lowest elevation, in meters. */
  elev_low?: number;
  /** Deprecated. Prefer to use sport_type. */
  type?: ActivityType;
  sport_type?: SportType;
  /** The time at which the activity was started. */
  start_date?: string;
  /**
   * NEVER USE THIS FIELD.
   * It's supposed to be the time at which the activity was started in the local
   * timezone, but it always uses the Z timezone, which makes it a different
   * timestamp.
   */
  start_date_local?: string;
  /** The timezone of the activity. */
  timezone?: string;
  start_latlng?: LatLng | null;
  end_latlng?: LatLng | null;
  /** The number of achievements gained during this activity. */
  achievement_count?: number;
  /** The number of kudos given for this activity. */
  kudos_count?: number;
  /** The number of comments for this activity. */
  comment_count?: number;
  /** The number of athletes for taking part in a group activity. */
  athlete_count?: number;
  /** The number of Instagram photos for this activity. */
  photo_count?: number;
  /** The number of Instagram and Strava photos for this activity. */
  total_photo_count?: number;
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
  workout_type?: number | null;
  /** The unique identifier of the upload in string format. */
  upload_id_str?: string;
  /** The activity's average speed, in meters per second. */
  average_speed?: number;
  /** The activity's max speed, in meters per second. */
  max_speed?: number;
  /** Whether the logged-in athlete has kudoed this activity. */
  has_kudoed?: boolean;
  /** Whether the activity is muted. */
  hide_from_home?: boolean;
  /** The id of the gear for the activity. */
  gear_id?: string;
  /** The total work done in kilojoules during this activity. Rides only. */
  kilojoules?: number;
  /** Average power output in watts during this activity. Rides only. */
  average_watts?: number;
  /** Whether the watts are from a power meter, false if estimated. */
  device_watts?: boolean;
  /** Rides with power meter data only. */
  max_watts?: number;
  /** Similar to Normalized Power. Rides with power meter data only. */
  weighted_average_watts?: number;
};

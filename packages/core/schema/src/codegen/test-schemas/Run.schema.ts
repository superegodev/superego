import DataType from "../../DataType.js";
import FormatId from "../../formats/FormatId.js";
import type Schema from "../../Schema.js";

export default {
  types: {
    RunType: {
      description: "Type of running activity.",
      dataType: DataType.Enum,
      members: {
        Treadmill: {
          description: "Running on a treadmill.",
          value: "TREADMILL",
        },
        Outdoor: {
          description: "Running outdoors on roads or paths.",
          value: "OUTDOOR",
        },
        Trail: {
          description: "Running on trails.",
          value: "TRAIL",
        },
      },
    },
    RatePerceivedExertion: {
      description:
        "A quantitative measure of perceived exertion during physical activity. Follows the Borg CR10 scale.",
      dataType: DataType.Enum,
      members: {
        RPE_0: { description: "No exertion.", value: "0" },
        RPE_0_5: { description: "Noticeable.", value: "0.5" },
        RPE_1: { description: "Very light.", value: "1" },
        RPE_2: { description: "Light.", value: "2" },
        RPE_3: { description: "Moderate.", value: "3" },
        RPE_4: { description: "Somewhat difficult.", value: "4" },
        RPE_5: { description: "Difficult.", value: "5" },
        RPE_6: { description: "Difficult.", value: "6" },
        RPE_7: { description: "Very difficult.", value: "7" },
        RPE_8: { description: "Very difficult.", value: "8" },
        RPE_9: { description: "Almost maximal.", value: "9" },
        RPE_10: { description: "Maximal.", value: "10" },
      },
    },
    WeatherCondition: {
      description: "General weather condition.",
      dataType: DataType.Enum,
      members: {
        Sunny: { value: "SUNNY" },
        Cloudy: { value: "CLOUDY" },
        Rainy: { value: "RAINY" },
        Snowy: { value: "SNOWY" },
      },
    },
    Weather: {
      description: "Weather conditions during the run.",
      dataType: DataType.Struct,
      properties: {
        temperatureCelsius: {
          description: "Temperature in Celsius.",
          dataType: DataType.Number,
        },
        condition: { dataType: null, ref: "WeatherCondition" },
        humidityPercent: {
          description: "Humidity in percentage.",
          dataType: DataType.Number,
        },
      },
      nullableProperties: ["humidityPercent"],
    },
    Run: {
      description:
        "Represents a single running activity performed by the user.",
      dataType: DataType.Struct,
      properties: {
        startTime: {
          description: "ISO 8601 timestamp of when the run started.",
          dataType: DataType.String,
          format: FormatId.String.Instant,
        },
        durationSeconds: {
          description: "Total duration of the run in seconds.",
          dataType: DataType.Number,
        },
        distanceMeters: {
          description: "Total distance of the run in meters.",
          dataType: DataType.Number,
        },
        type: {
          dataType: null,
          ref: "RunType",
        },
        averagePaceMinPerKm: {
          description: "Average pace in minutes per kilometer.",
          dataType: DataType.Number,
        },
        caloriesBurned: {
          description: "Estimated calories burned.",
          dataType: DataType.Number,
        },
        mapSnapshot: {
          description: "An image file of the route map.",
          dataType: DataType.File,
        },
        weather: {
          description: "Weather conditions during the run.",
          dataType: null,
          ref: "Weather",
        },
        isRace: {
          description: "Indicates if the run was part of a race.",
          dataType: DataType.Boolean,
        },
        notes: {
          description: "User's personal notes about the run.",
          dataType: DataType.String,
        },
        rpe: {
          dataType: null,
          ref: "RatePerceivedExertion",
        },
      },
      nullableProperties: [
        "averagePaceMinPerKm",
        "caloriesBurned",
        "mapSnapshot",
        "notes",
        "weather",
      ],
    },
  },
  rootType: "Run",
} satisfies Schema;

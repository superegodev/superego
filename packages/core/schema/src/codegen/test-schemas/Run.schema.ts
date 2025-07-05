import DataType from "../../DataType.js";
import FormatId from "../../formats/FormatId.js";
import type Schema from "../../Schema.js";

export default {
  types: {
    RunType: {
      description: { en: "Type of running activity." },
      dataType: DataType.Enum,
      members: {
        Treadmill: {
          description: { en: "Running on a treadmill." },
          value: "TREADMILL",
        },
        Outdoor: {
          description: { en: "Running outdoors on roads or paths." },
          value: "OUTDOOR",
        },
        Trail: {
          description: { en: "Running on trails." },
          value: "TRAIL",
        },
      },
    },
    RatePerceivedExertion: {
      description: {
        en: "A quantitative measure of perceived exertion during physical activity. Follows the Borg CR10 scale.",
      },
      dataType: DataType.Enum,
      members: {
        $0: { description: { en: "No exertion." }, value: "0" },
        $05: { description: { en: "Noticeable." }, value: "0.5" },
        $1: { description: { en: "Very light." }, value: "1" },
        $2: { description: { en: "Light." }, value: "2" },
        $3: { description: { en: "Moderate." }, value: "3" },
        $4: { description: { en: "Somewhat difficult." }, value: "4" },
        $5: { description: { en: "Difficult." }, value: "5" },
        $6: { description: { en: "Difficult." }, value: "6" },
        $7: { description: { en: "Very difficult." }, value: "7" },
        $8: { description: { en: "Very difficult." }, value: "8" },
        $9: { description: { en: "Almost maximal." }, value: "9" },
        $10: { description: { en: "Maximal." }, value: "10" },
      },
    },
    WeatherCondition: {
      description: { en: "General weather condition." },
      dataType: DataType.Enum,
      members: {
        Sunny: { value: "SUNNY" },
        Cloudy: { value: "CLOUDY" },
        Rainy: { value: "RAINY" },
        Snowy: { value: "SNOWY" },
      },
    },
    Weather: {
      description: { en: "Weather conditions during the run." },
      dataType: DataType.Struct,
      properties: {
        temperatureCelsius: {
          description: { en: "Temperature in Celsius." },
          dataType: DataType.Number,
        },
        condition: { dataType: null, ref: "WeatherCondition" },
        humidityPercent: {
          description: { en: "Humidity in percentage." },
          dataType: DataType.Number,
        },
      },
      nullableProperties: ["humidityPercent"],
    },
    Run: {
      description: {
        en: "Represents a single running activity performed by the user.",
      },
      dataType: DataType.Struct,
      properties: {
        startTime: {
          description: { en: "ISO 8601 timestamp of when the run started." },
          dataType: DataType.String,
          format: FormatId.String.Instant,
        },
        durationSeconds: {
          description: { en: "Total duration of the run in seconds." },
          dataType: DataType.Number,
        },
        distanceMeters: {
          description: { en: "Total distance of the run in meters." },
          dataType: DataType.Number,
        },
        type: {
          dataType: null,
          ref: "RunType",
        },
        averagePaceMinPerKm: {
          description: { en: "Average pace in minutes per kilometer." },
          dataType: DataType.Number,
        },
        caloriesBurned: {
          description: { en: "Estimated calories burned." },
          dataType: DataType.Number,
        },
        mapSnapshot: {
          description: { en: "An image file of the route map." },
          dataType: DataType.File,
        },
        weather: {
          description: { en: "Weather conditions during the run." },
          dataType: null,
          ref: "Weather",
        },
        isRace: {
          description: { en: "Indicates if the run was part of a race." },
          dataType: DataType.Boolean,
        },
        notes: {
          description: { en: "User's personal notes about the run." },
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

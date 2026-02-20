import {
  Alert,
  ButtonLink,
  SimpleMonthCalendar,
  Text,
  ToggleButton,
} from "@superego/app-sandbox/components";
import {
  useCreateDocument,
  useCreateNewDocumentVersion,
} from "@superego/app-sandbox/hooks";
import theme from "@superego/app-sandbox/theme";
import React from "react";
import type * as ProtoCollection_0 from "./ProtoCollection_0.js";

interface Props {
  collections: {
    /**
     * "Period Tracker" collection.
     */
    ProtoCollection_0: {
      id: "ProtoCollection_0";
      versionId: string;
      displayName: string;
      documents: {
        id: string;
        versionId: string;
        href: string;
        content: ProtoCollection_0.CycleDayLog;
      }[];
    };
  };
}

type DayDocument = Props["collections"]["ProtoCollection_0"]["documents"][number];
type Flow = ProtoCollection_0.Flow | null;
type LoggedFlow = Exclude<Flow, null>;
type BleedingFlow = Exclude<LoggedFlow, "None">;
type Phase = "Period" | "Fertile" | "Follicular" | "Luteal";
type FertilityLevel = 0 | 1 | 2 | 3;
type PredictionStatus = "no-data" | "logged" | "inferred" | "forecast";
type ConfidenceTier = "High" | "Medium" | "Low";

interface Episode {
  start: number;
  end: number;
  duration: number;
  loggedDays: Set<number>;
}

interface CompleteCycle {
  episodeIndex: number;
  start: number;
  endExclusive: number;
  length: number;
}

interface CycleModel {
  muCycle: number;
  sigmaCycle: number;
  muPeriod: number;
  periodFlowByDay: BleedingFlow[];
  fallbackPeriodFlow: BleedingFlow;
  muLuteal: number;
  sigmaLuteal: number;
  rangeLastSix: number;
  completeCycleCount: number;
}

interface PredictionContext {
  episodes: Episode[];
  completeCycles: CompleteCycle[];
  model: CycleModel | null;
  firstEpisodeStart: number | null;
  lastEpisodeStart: number | null;
}

interface ClassifiedDay {
  status: Exclude<PredictionStatus, "no-data">;
  phase: Phase;
  predictedFlow: Flow;
  fertilityLevel: FertilityLevel;
  cycleDay: number | null;
  cycleLength: number | null;
  cycleStep: number;
  rationale: string;
}

interface ConfidenceResult {
  score: number;
  tier: ConfidenceTier;
  notes: string[];
}

interface DayPrediction {
  status: PredictionStatus;
  phase: Phase | null;
  predictedFlow: Flow;
  fertilityLevel: FertilityLevel;
  cycleDay: number | null;
  cycleLength: number | null;
  confidenceScore: number | null;
  confidenceTier: ConfidenceTier | null;
  explanation: string | null;
}

const DAY_IN_MS = 24 * 60 * 60 * 1_000;

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;

const PERIOD_LENGTH_MIN = 2;
const PERIOD_LENGTH_MAX = 8;

const LUTEAL_LENGTH_DAYS = 13;
const LUTEAL_SIGMA_DAYS = 2;

const MAX_PERSONAL_CYCLES = 6;
const MERGEABLE_GAP_DAYS = 1;
const MAX_MERGED_EPISODE_DAYS = 8;
const FORECAST_MIN_COMPLETE_CYCLES = 2;

const IRREGULAR_RANGE_THRESHOLD = 9;
const IRREGULARITY_PENALTY = 0.8;
const SPARSE_DATA_PENALTY = 0.75;
const FORECAST_DECAY_RATE = 0.45;

const COLLECTION_ID = "ProtoCollection_0";

const DEFAULT_PERIOD_FLOW_PATTERN: BleedingFlow[] = [
  "Medium",
  "Heavy",
  "Medium",
  "Light",
  "Light",
  "Light",
  "Light",
  "Light",
];

const COMMON_SYMPTOMS = [
  "cramps",
  "headache",
  "fatigue",
  "bloating",
  "mood swings",
] as const;

const FLOW_OPTIONS: {
  label: string;
  value: Flow;
}[] = [
  { label: "None", value: "None" },
  { label: "Light", value: "Light" },
  { label: "Medium", value: "Medium" },
  { label: "Heavy", value: "Heavy" },
];

const FLOW_BUTTON_COLOR: `#${string}` = "#dc2626";

const PHASE_STYLES: Partial<
  Record<Phase, { backgroundColor: string; borderColor: string }>
> = {
  Period: {
    backgroundColor: theme.colors.reds._1,
    borderColor: theme.colors.reds._3,
  },
  Fertile: {
    backgroundColor: theme.colors.greens._1,
    borderColor: theme.colors.greens._3,
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function localDateToPlainDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function plainDateToOrdinal(plainDate: string): number {
  const [yearRaw, monthRaw, dayRaw] = plainDate.split("-");
  const year = Number.parseInt(yearRaw ?? "", 10);
  const month = Number.parseInt(monthRaw ?? "", 10);
  const day = Number.parseInt(dayRaw ?? "", 10);
  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    throw new Error(`Invalid plain date: ${plainDate}`);
  }
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_IN_MS);
}

function getTodayPlainDate(): string {
  return localDateToPlainDate(new Date());
}

function getFlowIndicator(flow: Flow): string | null {
  if (flow === null || flow === "None") {
    return null;
  }
  if (flow === "Light") {
    return "🩸";
  }
  if (flow === "Medium") {
    return "🩸🩸";
  }
  return "🩸🩸🩸";
}

function getFertilityIndicator(level: FertilityLevel): string | null {
  if (level <= 0) {
    return null;
  }
  return "🥚".repeat(level);
}

function phaseLabel(phase: Phase): string {
  if (phase === "Period") {
    return "Period";
  }
  if (phase === "Fertile") {
    return "Fertile";
  }
  if (phase === "Follicular") {
    return "Follicular";
  }
  return "Luteal";
}

function phaseDescription(phase: Phase): string {
  if (phase === "Period") {
    return "Period";
  }
  if (phase === "Fertile") {
    return "Fertile window";
  }
  if (phase === "Follicular") {
    return "Follicular";
  }
  return "Luteal";
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function fertilityLabel(level: FertilityLevel): string {
  if (level === 3) {
    return "Peak";
  }
  if (level === 2) {
    return "High";
  }
  if (level === 1) {
    return "Moderate";
  }
  return "Low";
}

function isBleedingFlow(flow: Flow): flow is BleedingFlow {
  return flow === "Light" || flow === "Medium" || flow === "Heavy";
}

function flowToSeverity(flow: Flow): number | null {
  if (flow === "Light") {
    return 1;
  }
  if (flow === "Medium") {
    return 2;
  }
  if (flow === "Heavy") {
    return 3;
  }
  return null;
}

function severityToFlow(value: number): BleedingFlow {
  if (value < 1.5) {
    return "Light";
  }
  if (value < 2.5) {
    return "Medium";
  }
  return "Heavy";
}

function weightedAverage(values: number[], weights: number[]): number | null {
  if (values.length === 0 || weights.length !== values.length) {
    return null;
  }

  let weightedSum = 0;
  let weightSum = 0;

  for (let index = 0; index < values.length; index += 1) {
    weightedSum += values[index]! * weights[index]!;
    weightSum += weights[index]!;
  }

  if (weightSum <= 0) {
    return null;
  }

  return weightedSum / weightSum;
}

function weightedMedian(values: number[], weights: number[]): number | null {
  if (values.length === 0 || weights.length !== values.length) {
    return null;
  }

  const pairs = values
    .map((value, index) => ({ value, weight: weights[index]! }))
    .sort((left, right) => left.value - right.value);

  const totalWeight = pairs.reduce((sum, pair) => sum + pair.weight, 0);
  if (totalWeight <= 0) {
    return null;
  }

  const midpoint = totalWeight / 2;
  let cumulative = 0;

  for (const pair of pairs) {
    cumulative += pair.weight;
    if (cumulative >= midpoint) {
      return pair.value;
    }
  }

  return pairs[pairs.length - 1]?.value ?? null;
}

function extractEpisodes(logsByDate: Map<string, DayDocument>): Episode[] {
  const explicitNoFlowOrdinals = new Set(
    [...logsByDate.values()]
      .filter((document) => document.content.flow === "None")
      .map((document) => plainDateToOrdinal(document.content.date)),
  );

  const bleedingOrdinals = [...logsByDate.values()]
    .filter((document) => isBleedingFlow(document.content.flow))
    .map((document) => plainDateToOrdinal(document.content.date))
    .sort((left, right) => left - right);

  if (bleedingOrdinals.length === 0) {
    return [];
  }

  const uniqueOrdinals = bleedingOrdinals.filter(
    (ordinal, index) => index === 0 || ordinal !== bleedingOrdinals[index - 1],
  );

  const runs: { start: number; end: number; loggedDays: number[] }[] = [];

  for (const ordinal of uniqueOrdinals) {
    const lastRun = runs[runs.length - 1];
    if (!lastRun || ordinal > lastRun.end + 1) {
      runs.push({
        start: ordinal,
        end: ordinal,
        loggedDays: [ordinal],
      });
      continue;
    }

    lastRun.end = ordinal;
    lastRun.loggedDays.push(ordinal);
  }

  const mergedRuns: { start: number; end: number; loggedDays: number[] }[] = [];

  for (const run of runs) {
    const previousRun = mergedRuns[mergedRuns.length - 1];
    if (!previousRun) {
      mergedRuns.push({
        start: run.start,
        end: run.end,
        loggedDays: [...run.loggedDays],
      });
      continue;
    }

    const gap = run.start - previousRun.end - 1;
    const mergedLength = run.end - previousRun.start + 1;
    const gapDay = previousRun.end + 1;
    const isExplicitNoFlowGapDay = explicitNoFlowOrdinals.has(gapDay);
    if (
      gap === MERGEABLE_GAP_DAYS &&
      mergedLength <= MAX_MERGED_EPISODE_DAYS &&
      !isExplicitNoFlowGapDay
    ) {
      previousRun.end = run.end;
      previousRun.loggedDays.push(...run.loggedDays);
      continue;
    }

    mergedRuns.push({
      start: run.start,
      end: run.end,
      loggedDays: [...run.loggedDays],
    });
  }

  return mergedRuns.map((run) => ({
    start: run.start,
    end: run.end,
    duration: run.end - run.start + 1,
    loggedDays: new Set(run.loggedDays),
  }));
}

function buildCompleteCycles(episodes: Episode[]): CompleteCycle[] {
  const completeCycles: CompleteCycle[] = [];

  for (let episodeIndex = 0; episodeIndex < episodes.length - 1; episodeIndex += 1) {
    const cycleStart = episodes[episodeIndex]!.start;
    const nextCycleStart = episodes[episodeIndex + 1]!.start;

    if (nextCycleStart <= cycleStart) {
      continue;
    }

    completeCycles.push({
      episodeIndex,
      start: cycleStart,
      endExclusive: nextCycleStart,
      length: nextCycleStart - cycleStart,
    });
  }

  return completeCycles;
}

function estimateCycleModelFromLastSix(
  completeCycles: CompleteCycle[],
  episodes: Episode[],
  loggedFlowsByOrdinal: Map<number, BleedingFlow>,
): CycleModel | null {
  if (completeCycles.length === 0) {
    return null;
  }

  const windowSize = Math.min(MAX_PERSONAL_CYCLES, completeCycles.length);
  const windowCycles = completeCycles.slice(-windowSize);

  const cycleLengths = windowCycles.map((cycle) => cycle.length);
  const weights = windowCycles.map((_, index) => {
    const i = index + 1;
    return 2 ** -((windowSize - i) / 2);
  });

  const cycleLengthAverage =
    weightedAverage(cycleLengths, weights) ?? DEFAULT_CYCLE_LENGTH;
  const muCycle = Math.max(1, Math.round(cycleLengthAverage));

  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const weightedSquaredDistanceSum = cycleLengths.reduce((sum, cycleLength, index) => {
    const distance = cycleLength - muCycle;
    return sum + weights[index]! * distance * distance;
  }, 0);
  const sigmaCycle =
    weightSum > 0 ? Math.sqrt(weightedSquaredDistanceSum / weightSum) : 0;

  const periodDurations = windowCycles.map(
    (cycle) => episodes[cycle.episodeIndex]!.duration,
  );
  const periodMedian =
    weightedMedian(periodDurations, weights) ?? DEFAULT_PERIOD_LENGTH;
  const muPeriod = clamp(
    Math.round(periodMedian),
    PERIOD_LENGTH_MIN,
    PERIOD_LENGTH_MAX,
  );

  const flowBuckets = Array.from({ length: PERIOD_LENGTH_MAX }, () => ({
    values: [] as number[],
    weights: [] as number[],
  }));
  const allFlowValues: number[] = [];
  const allFlowWeights: number[] = [];

  for (let index = 0; index < windowCycles.length; index += 1) {
    const cycle = windowCycles[index]!;
    const episode = episodes[cycle.episodeIndex]!;
    const weight = weights[index]!;
    const dayCount = Math.min(PERIOD_LENGTH_MAX, episode.duration);

    for (let offset = 0; offset < dayCount; offset += 1) {
      const dayOrdinal = episode.start + offset;
      const flow = loggedFlowsByOrdinal.get(dayOrdinal);
      const severity = flowToSeverity(flow ?? null);
      if (severity === null) {
        continue;
      }

      flowBuckets[offset]!.values.push(severity);
      flowBuckets[offset]!.weights.push(weight);
      allFlowValues.push(severity);
      allFlowWeights.push(weight);
    }
  }

  const fallbackPeriodFlow = severityToFlow(
    weightedMedian(allFlowValues, allFlowWeights) ?? 2,
  );
  const periodFlowByDay = flowBuckets.map((bucket, dayIndex) => {
    const severity = weightedAverage(bucket.values, bucket.weights);
    if (severity !== null) {
      return severityToFlow(severity);
    }
    return DEFAULT_PERIOD_FLOW_PATTERN[dayIndex] ?? fallbackPeriodFlow;
  });

  const rangeLastSix =
    cycleLengths.length > 0
      ? Math.max(...cycleLengths) - Math.min(...cycleLengths)
      : 0;

  return {
    muCycle,
    sigmaCycle,
    muPeriod,
    periodFlowByDay,
    fallbackPeriodFlow,
    muLuteal: LUTEAL_LENGTH_DAYS,
    sigmaLuteal: LUTEAL_SIGMA_DAYS,
    rangeLastSix,
    completeCycleCount: completeCycles.length,
  };
}

function buildLoggedFlowsByOrdinal(
  logsByDate: Map<string, DayDocument>,
): Map<number, BleedingFlow> {
  const loggedFlowsByOrdinal = new Map<number, BleedingFlow>();

  for (const log of logsByDate.values()) {
    const flow = log.content.flow;
    if (!isBleedingFlow(flow)) {
      continue;
    }

    loggedFlowsByOrdinal.set(plainDateToOrdinal(log.content.date), flow);
  }

  return loggedFlowsByOrdinal;
}

function buildPredictionContext(
  logsByDate: Map<string, DayDocument>,
): PredictionContext {
  const episodes = extractEpisodes(logsByDate);
  const completeCycles = buildCompleteCycles(episodes);
  const loggedFlowsByOrdinal = buildLoggedFlowsByOrdinal(logsByDate);
  const model = estimateCycleModelFromLastSix(
    completeCycles,
    episodes,
    loggedFlowsByOrdinal,
  );

  return {
    episodes,
    completeCycles,
    model,
    firstEpisodeStart: episodes[0]?.start ?? null,
    lastEpisodeStart: episodes[episodes.length - 1]?.start ?? null,
  };
}

function findCompleteCycleContainingDay(
  dayOrdinal: number,
  completeCycles: CompleteCycle[],
): CompleteCycle | null {
  for (const cycle of completeCycles) {
    if (dayOrdinal >= cycle.start && dayOrdinal < cycle.endExclusive) {
      return cycle;
    }
  }
  return null;
}

function findEpisodeContainingDay(
  dayOrdinal: number,
  episodes: Episode[],
): Episode | null {
  for (const episode of episodes) {
    if (dayOrdinal >= episode.start && dayOrdinal <= episode.end) {
      return episode;
    }
  }
  return null;
}

function fertilityLevelInFertileWindow(
  dayOrdinal: number,
  fertileWindowStart: number,
  ovulationDay: number,
): FertilityLevel {
  if (dayOrdinal < fertileWindowStart || dayOrdinal > ovulationDay) {
    return 0;
  }

  const distanceToOvulation = ovulationDay - dayOrdinal;
  if (distanceToOvulation === 0) {
    return 3;
  }
  if (distanceToOvulation === 1) {
    return 2;
  }
  return 1;
}

function resolvePeriodFlowForCycleDay(
  cycleDay: number,
  model: CycleModel,
): BleedingFlow {
  const dayIndex = clamp(cycleDay - 1, 0, PERIOD_LENGTH_MAX - 1);
  return model.periodFlowByDay[dayIndex] ?? model.fallbackPeriodFlow;
}

function classifyClosedCycleDay(
  dayOrdinal: number,
  cycle: CompleteCycle,
  model: CycleModel,
  loggedFlow: Flow,
): ClassifiedDay {
  const cycleDay = dayOrdinal - cycle.start + 1;
  const isLoggedNoFlow = loggedFlow === "None";
  const isLoggedBleeding = isBleedingFlow(loggedFlow);
  const classificationStatus: Exclude<PredictionStatus, "no-data"> = isLoggedNoFlow
    ? "logged"
    : "inferred";
  const withNoFlowRationale = (rationale: string): string =>
    isLoggedNoFlow ? `No flow logged for this day. ${rationale}` : rationale;

  if (isLoggedBleeding) {
    return {
      status: "logged",
      phase: "Period",
      predictedFlow: loggedFlow,
      fertilityLevel: 0,
      cycleDay,
      cycleLength: cycle.length,
      cycleStep: 1,
      rationale: "Logged phase.",
    };
  }

  const inferredPeriodEnd = Math.min(
    cycle.start + model.muPeriod - 1,
    cycle.endExclusive - 1,
  );

  if (!isLoggedNoFlow && dayOrdinal <= inferredPeriodEnd) {
    return {
      status: "inferred",
      phase: "Period",
      predictedFlow: resolvePeriodFlowForCycleDay(cycleDay, model),
      fertilityLevel: 0,
      cycleDay,
      cycleLength: cycle.length,
      cycleStep: 1,
      rationale:
        "Likely period day from your personalized period duration estimate.",
    };
  }

  const ovulationDay = cycle.endExclusive - model.muLuteal;
  const fertileWindowStart = ovulationDay - 5;

  if (dayOrdinal >= fertileWindowStart && dayOrdinal <= ovulationDay) {
    return {
      status: classificationStatus,
      phase: "Fertile",
      predictedFlow: null,
      fertilityLevel: fertilityLevelInFertileWindow(
        dayOrdinal,
        fertileWindowStart,
        ovulationDay,
      ),
      cycleDay,
      cycleLength: cycle.length,
      cycleStep: 1,
      rationale: withNoFlowRationale(
        "Likely fertile window (6 days ending on estimated ovulation).",
      ),
    };
  }

  if (dayOrdinal < fertileWindowStart) {
    return {
      status: classificationStatus,
      phase: "Follicular",
      predictedFlow: null,
      fertilityLevel: 0,
      cycleDay,
      cycleLength: cycle.length,
      cycleStep: 1,
      rationale: withNoFlowRationale(
        "Likely follicular phase between period and fertile window.",
      ),
    };
  }

  return {
    status: classificationStatus,
    phase: "Luteal",
    predictedFlow: null,
    fertilityLevel: 0,
    cycleDay,
    cycleLength: cycle.length,
    cycleStep: 1,
    rationale: withNoFlowRationale(
      "Likely luteal phase after estimated ovulation.",
    ),
  };
}

function classifyForecastDay(
  dayOrdinal: number,
  lastEpisodeStart: number,
  model: CycleModel,
  loggedFlow: Flow,
): ClassifiedDay {
  const cycleLength = Math.max(1, model.muCycle);
  const cycleStep = Math.max(
    1,
    Math.floor((dayOrdinal - lastEpisodeStart) / cycleLength) + 1,
  );
  const cycleStart = lastEpisodeStart + (cycleStep - 1) * cycleLength;
  const cycleDay = dayOrdinal - cycleStart + 1;
  const isLoggedNoFlow = loggedFlow === "None";
  const isLoggedBleeding = isBleedingFlow(loggedFlow);
  const classificationStatus: Exclude<PredictionStatus, "no-data"> = isLoggedNoFlow
    ? "logged"
    : "forecast";
  const withNoFlowRationale = (rationale: string): string =>
    isLoggedNoFlow ? `No flow logged for this day. ${rationale}` : rationale;

  if (isLoggedBleeding) {
    return {
      status: "logged",
      phase: "Period",
      predictedFlow: loggedFlow,
      fertilityLevel: 0,
      cycleDay,
      cycleLength,
      cycleStep,
      rationale: "Logged phase.",
    };
  }

  const periodEnd = cycleStart + model.muPeriod - 1;
  if (!isLoggedNoFlow && dayOrdinal <= periodEnd) {
    return {
      status: "forecast",
      phase: "Period",
      predictedFlow: resolvePeriodFlowForCycleDay(cycleDay, model),
      fertilityLevel: 0,
      cycleDay,
      cycleLength,
      cycleStep,
      rationale:
        "Likely period window projected from your last 6 complete cycles.",
    };
  }

  const ovulationDay = cycleStart + (cycleLength - model.muLuteal);
  const fertileWindowStart = ovulationDay - 5;

  if (dayOrdinal >= fertileWindowStart && dayOrdinal <= ovulationDay) {
    return {
      status: classificationStatus,
      phase: "Fertile",
      predictedFlow: null,
      fertilityLevel: fertilityLevelInFertileWindow(
        dayOrdinal,
        fertileWindowStart,
        ovulationDay,
      ),
      cycleDay,
      cycleLength,
      cycleStep,
      rationale: withNoFlowRationale(
        "Likely fertile window (6 days ending on predicted ovulation).",
      ),
    };
  }

  if (dayOrdinal < fertileWindowStart) {
    return {
      status: classificationStatus,
      phase: "Follicular",
      predictedFlow: null,
      fertilityLevel: 0,
      cycleDay,
      cycleLength,
      cycleStep,
      rationale: withNoFlowRationale(
        "Likely follicular phase before the predicted fertile window.",
      ),
    };
  }

  return {
    status: classificationStatus,
    phase: "Luteal",
    predictedFlow: null,
    fertilityLevel: 0,
    cycleDay,
    cycleLength,
    cycleStep,
    rationale: withNoFlowRationale(
      "Likely luteal phase after predicted ovulation.",
    ),
  };
}

function confidenceTierFromScore(score: number): ConfidenceTier {
  if (score >= 0.75) {
    return "High";
  }
  if (score >= 0.5) {
    return "Medium";
  }
  return "Low";
}

function computeConfidence(
  status: Exclude<PredictionStatus, "no-data">,
  model: CycleModel | null,
  cycleStep: number,
): ConfidenceResult {
  if (status === "logged") {
    return {
      score: 1,
      tier: "High",
      notes: [],
    };
  }

  let score = status === "inferred" ? 0.8 : 0.6;
  const notes: string[] = [];

  if (status === "forecast") {
    score *= Math.exp(-FORECAST_DECAY_RATE * (cycleStep - 1));
    if (cycleStep > 1) {
      notes.push("Confidence decreases for farther forecast cycles.");
    }
  }

  if (model) {
    if (model.rangeLastSix > IRREGULAR_RANGE_THRESHOLD) {
      score *= IRREGULARITY_PENALTY;
      notes.push("Recent cycle lengths vary more than 9 days.");
    }

    if (model.completeCycleCount < 3) {
      score *= SPARSE_DATA_PENALTY;
      notes.push("Fewer than 3 complete cycles are available.");
    }

    if (model.sigmaCycle >= 4) {
      notes.push("Cycle-length variability is high.");
    }
  }

  const clampedScore = clamp(score, 0, 1);
  return {
    score: clampedScore,
    tier: confidenceTierFromScore(clampedScore),
    notes,
  };
}

function formatConfidenceScore(score: number | null): string | null {
  if (score === null) {
    return null;
  }
  return `${Math.round(score * 100)}%`;
}

function noDataPrediction(): DayPrediction {
  return {
    status: "no-data",
    phase: null,
    predictedFlow: null,
    fertilityLevel: 0,
    cycleDay: null,
    cycleLength: null,
    confidenceScore: null,
    confidenceTier: null,
    explanation: null,
  };
}

function predictDay(
  day: string,
  context: PredictionContext,
  log: ProtoCollection_0.CycleDayLog | null,
): DayPrediction {
  const dayOrdinal = plainDateToOrdinal(day);
  const loggedFlow = log?.flow ?? null;
  const isLoggedBleeding = isBleedingFlow(loggedFlow);

  if (context.firstEpisodeStart === null) {
    return isLoggedBleeding
      ? {
          status: "logged",
          phase: "Period",
          predictedFlow: loggedFlow,
          fertilityLevel: 0,
          cycleDay: 1,
          cycleLength: null,
          confidenceScore: 1,
          confidenceTier: "High",
          explanation: "Logged phase.",
        }
      : noDataPrediction();
  }

  if (dayOrdinal < context.firstEpisodeStart && !isLoggedBleeding) {
    return noDataPrediction();
  }

  const { model } = context;

  let classified: ClassifiedDay | null = null;

  if (model) {
    const closedCycle = findCompleteCycleContainingDay(
      dayOrdinal,
      context.completeCycles,
    );
    if (closedCycle) {
      classified = classifyClosedCycleDay(
        dayOrdinal,
        closedCycle,
        model,
        loggedFlow,
      );
    }
  }

  if (
    classified === null &&
    model &&
    context.lastEpisodeStart !== null &&
    dayOrdinal >= context.lastEpisodeStart &&
    model.completeCycleCount >= FORECAST_MIN_COMPLETE_CYCLES
  ) {
    classified = classifyForecastDay(
      dayOrdinal,
      context.lastEpisodeStart,
      model,
      loggedFlow,
    );
  }

  if (classified === null && isLoggedBleeding) {
    const episode = findEpisodeContainingDay(dayOrdinal, context.episodes);
    classified = {
      status: "logged",
      phase: "Period",
      predictedFlow: loggedFlow,
      fertilityLevel: 0,
      cycleDay: episode ? dayOrdinal - episode.start + 1 : 1,
      cycleLength: model?.muCycle ?? null,
      cycleStep: 1,
      rationale: "Logged phase.",
    };
  }

  if (classified === null) {
    return noDataPrediction();
  }

  const confidence = computeConfidence(
    classified.status,
    model,
    classified.cycleStep,
  );

  const explanation =
    classified.status === "logged"
      ? null
      : [classified.rationale, ...confidence.notes].join(" ");

  return {
    status: classified.status,
    phase: classified.phase,
    predictedFlow: classified.predictedFlow,
    fertilityLevel: classified.fertilityLevel,
    cycleDay: classified.cycleDay,
    cycleLength: classified.cycleLength,
    confidenceScore: confidence.score,
    confidenceTier: confidence.tier,
    explanation,
  };
}

export default function App(props: Props): React.ReactElement | null {
  const logs = props.collections.ProtoCollection_0.documents;
  const collectionId = props.collections.ProtoCollection_0.id;

  const logsByDate = React.useMemo(() => {
    const byDate = new Map<string, DayDocument>();
    for (const log of logs) {
      byDate.set(log.content.date, log);
    }
    return byDate;
  }, [logs]);

  const predictionContext = React.useMemo(
    () => buildPredictionContext(logsByDate),
    [logsByDate],
  );

  const createDocument = useCreateDocument();
  const createNewDocumentVersion = useCreateNewDocumentVersion();

  const isMutating = createDocument.isPending || createNewDocumentVersion.isPending;

  const mutationError =
    createNewDocumentVersion.error?.name ?? createDocument.error?.name ?? null;

  const upsertLog = React.useCallback(
    (
      day: string,
      updater: (
        log: ProtoCollection_0.CycleDayLog,
      ) => ProtoCollection_0.CycleDayLog,
    ) => {
      if (isMutating) {
        return;
      }

      const existingLog = logsByDate.get(day);

      const base: ProtoCollection_0.CycleDayLog = existingLog
        ? existingLog.content
        : {
            date: day,
            flow: null,
            symptoms: null,
            notes: null,
          };

      const next = updater(base);

      if (existingLog) {
        createNewDocumentVersion.mutate(
          COLLECTION_ID,
          existingLog.id,
          existingLog.versionId,
          next,
        );
      } else {
        createDocument.mutate({ collectionId: COLLECTION_ID, content: next });
      }
    },
    [createDocument, createNewDocumentVersion, isMutating, logsByDate],
  );

  const onFlowChange = React.useCallback(
    (day: string, nextFlow: Flow) => {
      upsertLog(day, (log) => ({
        ...log,
        flow: nextFlow,
      }));
    },
    [upsertLog],
  );

  const onSymptomChange = React.useCallback(
    (day: string, symptom: string, enabled: boolean) => {
      upsertLog(day, (log) => {
        const currentSymptoms = log.symptoms ?? [];

        const nextSymptoms = enabled
          ? currentSymptoms.includes(symptom)
            ? currentSymptoms
            : [...currentSymptoms, symptom]
          : currentSymptoms.filter((currentSymptom) => currentSymptom !== symptom);

        return {
          ...log,
          symptoms: nextSymptoms.length > 0 ? nextSymptoms : null,
        };
      });
    },
    [upsertLog],
  );

  const renderDayCell = React.useCallback(
    (day: string): React.ReactElement => {
      const log = logsByDate.get(day)?.content ?? null;
      const prediction = predictDay(day, predictionContext, log);
      const today = getTodayPlainDate();
      const isFutureDay = day > today;

      if (prediction.status === "no-data" || prediction.phase === null) {
        return (
          <SimpleMonthCalendar.DayCell>
            <div style={{ height: "100%" }} />
          </SimpleMonthCalendar.DayCell>
        );
      }

      const phaseStyle = PHASE_STYLES[prediction.phase];
      const isPredictedDay =
        prediction.status === "inferred" || prediction.status === "forecast";
      const shouldUseDashedBorder =
        isPredictedDay &&
        (prediction.phase === "Period" || prediction.phase === "Fertile");

      const flowIndicator = getFlowIndicator(prediction.predictedFlow);
      const fertilityIndicator =
        prediction.phase === "Fertile"
          ? getFertilityIndicator(prediction.fertilityLevel)
          : null;
      const symptomsPreview = (log?.symptoms ?? []).slice(0, 2);

      return (
        <SimpleMonthCalendar.DayCell
          style={
            phaseStyle
              ? {
                  backgroundColor: phaseStyle.backgroundColor,
                  borderColor: phaseStyle.borderColor,
                  borderStyle: shouldUseDashedBorder ? "dashed" : "solid",
                }
              : undefined
          }
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.15rem",
              height: "100%",
            }}
          >
            {flowIndicator ? (
              <Text element="span" size="sm" style={{ lineHeight: 1.1 }}>
                {flowIndicator}
              </Text>
            ) : null}
            {fertilityIndicator ? (
              <Text element="span" size="xs" style={{ lineHeight: 1.1 }}>
                {fertilityIndicator}
              </Text>
            ) : null}
            {isFutureDay &&
            !flowIndicator &&
            !fertilityIndicator &&
            (prediction.phase === "Period" || prediction.phase === "Fertile") ? (
              <Text
                element="span"
                size="xs"
                color="secondary"
                style={{ lineHeight: 1.1, textAlign: "center" }}
              >
                {phaseDescription(prediction.phase)}
              </Text>
            ) : null}
            {symptomsPreview.map((symptom, index) => (
              <Text
                key={`${symptom}-${index}`}
                element="span"
                size="xs"
                style={{
                  display: "block",
                  lineHeight: 1.1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {capitalize(symptom)}
              </Text>
            ))}
          </div>
        </SimpleMonthCalendar.DayCell>
      );
    },
    [predictionContext, logsByDate],
  );

  const renderDayPopover = React.useCallback(
    (day: string): React.ReactElement => {
      const logDocument = logsByDate.get(day) ?? null;
      const log = logDocument?.content ?? null;
      const detailsHref =
        logDocument !== null
          ? logDocument.href
          : null;
      const prediction = predictDay(day, predictionContext, log);
      const today = getTodayPlainDate();
      const isFutureDay = day > today;

      if (isFutureDay) {
        if (prediction.status === "no-data" || prediction.phase === null) {
          return (
            <SimpleMonthCalendar.DayPopover>
              <Alert variant="neutral" title="Not enough data">
                <Text element="p" size="sm" color="secondary">
                  Record your period to start seeing predictions.
                </Text>
              </Alert>
            </SimpleMonthCalendar.DayPopover>
          );
        }

        return (
          <SimpleMonthCalendar.DayPopover>
            <Text element="p" size="sm" style={{ marginTop: "0.5rem" }}>
              Phase:{" "}
              <Text element="span" size="sm" weight="bold">
                {phaseLabel(prediction.phase)}
              </Text>
            </Text>
            <Text element="p" size="sm">
              Fertility:{" "}
              <Text element="span" size="sm" weight="bold">
                {fertilityLabel(prediction.fertilityLevel)}
              </Text>
            </Text>
            {prediction.cycleDay !== null && prediction.cycleLength !== null ? (
              <Text element="p" size="sm">
                Cycle day:{" "}
                <Text element="span" size="sm" weight="bold">
                  {prediction.cycleDay} of {prediction.cycleLength}
                </Text>
              </Text>
            ) : null}
            {prediction.status !== "logged" &&
            prediction.confidenceScore !== null ? (
              <Text element="p" size="sm">
                Prediction confidence:{" "}
                <Text element="span" size="sm" weight="bold">
                  {formatConfidenceScore(prediction.confidenceScore)}
                </Text>
              </Text>
            ) : null}
            {detailsHref ? (
              <div
                style={{
                  marginTop: "0.75rem",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <ButtonLink size="sm" href={detailsHref} target="_top">
                  View details
                </ButtonLink>
              </div>
            ) : null}
          </SimpleMonthCalendar.DayPopover>
        );
      }

      const currentFlow = log?.flow ?? null;
      const currentSymptoms = log?.symptoms ?? [];

      return (
        <SimpleMonthCalendar.DayPopover>
          {prediction.status === "no-data" || prediction.phase === null ? (
            <Text element="p" size="sm" color="secondary">
              Not enough data to predict cycle phase for this day.
            </Text>
          ) : (
            <>
              <Text element="p" size="sm">
                Phase:{" "}
                <Text element="span" size="sm" weight="bold">
                  {phaseLabel(prediction.phase)}
                </Text>
              </Text>
              <Text element="p" size="sm">
                Fertility:{" "}
                <Text element="span" size="sm" weight="bold">
                  {fertilityLabel(prediction.fertilityLevel)}
                </Text>
              </Text>
              {prediction.cycleDay !== null && prediction.cycleLength !== null ? (
                <Text element="p" size="sm">
                  Cycle day:{" "}
                  <Text element="span" size="sm" weight="bold">
                    {prediction.cycleDay} of {prediction.cycleLength}
                  </Text>
                </Text>
              ) : null}
              {prediction.status !== "logged" &&
              prediction.confidenceScore !== null ? (
                <Text element="p" size="sm">
                  Prediction confidence:{" "}
                  <Text element="span" size="sm" weight="bold">
                    {formatConfidenceScore(prediction.confidenceScore)}
                  </Text>
                </Text>
              ) : null}
            </>
          )}

          <Text
            element="h4"
            size="lg"
            weight="semibold"
          >
            Flow
          </Text>
          <div
            style={{
              marginTop: "0.5rem",
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "0.5rem",
            }}
          >
            {FLOW_OPTIONS.map((option) => (
              <ToggleButton
                key={option.label}
                size="lg"
                fullWidth={true}
                color={FLOW_BUTTON_COLOR}
                value={currentFlow === option.value}
                onChange={(nextValue: boolean) => {
                  if (isMutating) {
                    return;
                  }
                  onFlowChange(day, nextValue ? option.value : null);
                }}
              >
                <Text
                  element="span"
                  size="sm"
                  weight="medium"
                  style={{ color: "inherit", padding: "0.25rem 0" }}
                >
                  {option.label}
                </Text>
              </ToggleButton>
            ))}
          </div>

          <Text
            element="h4"
            size="lg"
            weight="semibold"
          >
            Symptoms
          </Text>
          <div
            style={{
              marginTop: "0.5rem",
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "0.5rem",
            }}
          >
            {COMMON_SYMPTOMS.map((symptom) => (
              <ToggleButton
                key={symptom}
                size="lg"
                fullWidth={true}
                color="#2563eb"
                value={currentSymptoms.includes(symptom)}
                onChange={(nextValue: boolean) => {
                  if (isMutating) {
                    return;
                  }
                  onSymptomChange(day, symptom, nextValue);
                }}
              >
                <Text
                  element="span"
                  size="sm"
                  weight="medium"
                  style={{ color: "inherit", padding: "0.25rem 0" }}
                >
                  {capitalize(symptom)}
                </Text>
              </ToggleButton>
            ))}
          </div>
          {mutationError ? (
            <Alert
              variant="error"
              title="Could not save changes"
              style={{ marginTop: "1rem" }}
            >
              <Text element="p" size="sm" color="secondary">
                Error: {mutationError}
              </Text>
            </Alert>
          ) : null}
          {detailsHref ? (
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <ButtonLink size="sm" href={detailsHref} target="_top">
                View details
              </ButtonLink>
            </div>
          ) : null}
        </SimpleMonthCalendar.DayPopover>
      );
    },
    [
      predictionContext,
      isMutating,
      mutationError,
      collectionId,
      onFlowChange,
      onSymptomChange,
      logsByDate,
    ],
  );

  return (
    <SimpleMonthCalendar
      firstDayOfWeek="mon"
      renderDayCell={renderDayCell}
      renderDayPopover={renderDayPopover}
    />
  );
}

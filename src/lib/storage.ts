import {
  createDefaultConfig,
  type AppConfig,
  type AppState,
  type DayRecord,
  type PhasePattern,
  type Records,
  type TaperPhase,
} from "./plan";
import type { ISODate } from "./date";
import { DEFAULT_LOCALE, isLocale } from "./i18n";

export const STORAGE_KEY_V2 = "taper-calendar-v2";
export const STORAGE_KEY_V1 = "omez-taper-calendar-v1";

type LegacyRecord = {
  done?: boolean;
  gaviscon?: boolean;
  rennie?: boolean;
  heartburn?: boolean;
  pain?: boolean;
  note?: string;
};

type LegacyRecords = Record<ISODate, LegacyRecord>;

export function createDefaultState(): AppState {
  return {
    config: createDefaultConfig(),
    records: {},
  };
}

export function loadState(): AppState {
  try {
    if (typeof window === "undefined") return createDefaultState();

    const savedV2 = window.localStorage.getItem(STORAGE_KEY_V2);
    if (savedV2) {
      const parsed = safeParse(savedV2);
      if (isStoredStateCandidate(parsed)) return normalizeAppState(parsed);
    }

    const savedV1 = window.localStorage.getItem(STORAGE_KEY_V1);
    if (savedV1) {
      const parsed = safeParse(savedV1);
      if (isRecordMap(parsed)) {
        return {
          config: createDefaultConfig(),
          records: migrateLegacyRecords(parsed as LegacyRecords),
        };
      }
    }

    return createDefaultState();
  } catch {
    return createDefaultState();
  }
}

export function normalizeAppState(value: unknown): AppState {
  const fallback = createDefaultState();
  if (!isPlainObject(value) || !isPlainObject(value.config)) return fallback;

  return {
    config: normalizeConfig(value.config),
    records: normalizeRecords(value.records),
  };
}

export function saveState(state: AppState): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(state));
  } catch {
    // localStorage can be unavailable in private or restricted browser contexts.
  }
}

export function migrateLegacyRecords(records: LegacyRecords): Records {
  return Object.fromEntries(
    Object.entries(records).filter(([iso]) => isISODate(iso)).map(([iso, record]) => [
      iso,
      normalizeDayRecord({
        done: record.done,
        supportMedication: record.gaviscon,
        rescueMedication: record.rennie,
        heartburn: record.heartburn,
        painOrBloating: record.pain,
        note: record.note,
      }),
    ]),
  );
}

function safeParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function normalizeConfig(value: Record<string, unknown>): AppConfig {
  const fallback = createDefaultConfig();

  return {
    locale: isLocale(value.locale) ? value.locale : DEFAULT_LOCALE,
    startDate: isISODate(value.startDate) ? value.startDate : fallback.startDate,
    medicationName: nonEmptyString(value.medicationName) ?? fallback.medicationName,
    doseLabel: stringValue(value.doseLabel) ?? fallback.doseLabel,
    defaultTime: stringValue(value.defaultTime) ?? fallback.defaultTime,
    supportMedicationName: nonEmptyString(value.supportMedicationName) ?? fallback.supportMedicationName,
    rescueMedicationName: nonEmptyString(value.rescueMedicationName) ?? fallback.rescueMedicationName,
    symptomLabels: normalizeSymptomLabels(value.symptomLabels, fallback.symptomLabels),
    phases: normalizePhases(value.phases, fallback.phases),
  };
}

function normalizeSymptomLabels(value: unknown, fallback: AppConfig["symptomLabels"]): AppConfig["symptomLabels"] {
  if (!isPlainObject(value)) return fallback;

  return {
    heartburn: nonEmptyString(value.heartburn) ?? fallback.heartburn,
    painOrBloating: nonEmptyString(value.painOrBloating) ?? fallback.painOrBloating,
  };
}

function normalizePhases(value: unknown, fallback: TaperPhase[]): TaperPhase[] {
  if (!Array.isArray(value)) return fallback;

  const phases = value
    .map((phase) => normalizePhase(phase))
    .filter((phase): phase is TaperPhase => Boolean(phase));

  return phases.length > 0 ? phases : fallback;
}

function normalizePhase(value: unknown): TaperPhase | undefined {
  if (!isPlainObject(value)) return undefined;

  const id = nonEmptyString(value.id);
  const title = nonEmptyString(value.title);
  const durationDays = positiveInteger(value.durationDays);
  const pattern = normalizePattern(value.pattern);
  const takeDetails = stringValue(value.takeDetails);
  const skipDetails = stringValue(value.skipDetails);
  const asNeededDetails = stringValue(value.asNeededDetails);

  if (!id || !title || !durationDays || !pattern || takeDetails === undefined || skipDetails === undefined) {
    return undefined;
  }

  return {
    id,
    title,
    durationDays,
    pattern,
    takeDetails,
    skipDetails,
    ...(asNeededDetails !== undefined ? { asNeededDetails } : {}),
  };
}

function normalizePattern(value: unknown): PhasePattern | undefined {
  if (!isPlainObject(value) || typeof value.type !== "string") return undefined;

  if (value.type === "take-every-day" || value.type === "as-needed") {
    return { type: value.type };
  }

  if (value.type === "skip-weekdays") {
    if (!Array.isArray(value.weekdays)) return undefined;
    const weekdays = value.weekdays.filter(isWeekday);
    return weekdays.length > 0 ? { type: "skip-weekdays", weekdays } : undefined;
  }

  if (value.type === "every-n-days") {
    const interval = positiveInteger(value.interval);
    if (!interval) return undefined;
    const takeOnRemainder =
      typeof value.takeOnRemainder === "number" &&
      Number.isInteger(value.takeOnRemainder) &&
      value.takeOnRemainder >= 0 &&
      value.takeOnRemainder < interval
        ? value.takeOnRemainder
        : 0;
    return { type: "every-n-days", interval, takeOnRemainder };
  }

  if (value.type === "custom-sequence") {
    if (!Array.isArray(value.sequence)) return undefined;
    const sequence = value.sequence.filter(isCustomSequenceStep);
    return sequence.length > 0 ? { type: "custom-sequence", sequence } : undefined;
  }

  return undefined;
}

function normalizeRecords(value: unknown): Records {
  if (!isPlainObject(value)) return {};

  return Object.fromEntries(
    Object.entries(value)
      .filter(([iso]) => isISODate(iso))
      .map(([iso, record]) => [iso, normalizeDayRecord(record)]),
  );
}

function normalizeDayRecord(value: unknown): DayRecord {
  if (!isPlainObject(value)) return {};

  return {
    ...(typeof value.done === "boolean" ? { done: value.done } : {}),
    ...(typeof value.supportMedication === "boolean" ? { supportMedication: value.supportMedication } : {}),
    ...(typeof value.rescueMedication === "boolean" ? { rescueMedication: value.rescueMedication } : {}),
    ...(typeof value.heartburn === "boolean" ? { heartburn: value.heartburn } : {}),
    ...(typeof value.painOrBloating === "boolean" ? { painOrBloating: value.painOrBloating } : {}),
    ...(typeof value.note === "string" ? { note: value.note } : {}),
  };
}

function isStoredStateCandidate(value: unknown): boolean {
  return isPlainObject(value) && isPlainObject(value.config);
}

function isRecordMap(value: unknown): value is Record<string, unknown> {
  return isPlainObject(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isISODate(value: unknown): value is ISODate {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function positiveInteger(value: unknown): number | undefined {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : undefined;
}

function isWeekday(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 6;
}

function isCustomSequenceStep(value: unknown): value is "take" | "skip" | "asNeeded" {
  return value === "take" || value === "skip" || value === "asNeeded";
}
